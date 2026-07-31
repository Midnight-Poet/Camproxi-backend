import {
	forwardRef,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import authConfig from '../../common/auth/config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MailService } from 'src/common/mail/mail.service';
import { SmsService } from 'src/common/sms/sms.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { RecipientType, NotificationType, NotificationCat } from '@prisma/client';

@Injectable()
export class StudentAuthService {
	constructor(
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		private readonly comparePassword: HashtagProvider,
		@Inject(authConfig.KEY)
		private readonly authConfiguration: ConfigType<typeof authConfig>,
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
		private readonly smsService: SmsService,
		private readonly notificationService: NotificationService,
	) {}

	public async login(user: LoginDto) {
		const userDetail = await this.usersService.getUserByEmail(user.email);
		const passwordMatch = await this.comparePassword.comparePassword(
			user.password,
			userDetail.password,
		);
		if (passwordMatch) {
			const token = await this.jwtService.signAsync(
				{
					sub: userDetail.id,
					email: userDetail.email,
					schoolId: userDetail.schoolId,
				},
				{
					secret: this.authConfiguration.secret,
					expiresIn: '2d',
					audience: this.authConfiguration.audience,
					issuer: this.authConfiguration.issuer,
				},
			);
			return {
				token: token,
				user: {
					id: userDetail.id,
					email: userDetail.email,
					name: `${userDetail.firstName} ${userDetail.lastName}`,
				},
			};
		} else {
			throw new UnauthorizedException('Incorrect Password');
		}
	}

	public async createUser(user: CreateUserDto) {
		try {
			const res = await this.usersService.addNewUser(user);

			const token = await this.jwtService.signAsync(
				{
					sub: res.id,
					email: res.email,
					schoolId: res.schoolId,
				},
				{
					secret: this.authConfiguration.secret,
					expiresIn: '2d',
					audience: this.authConfiguration.audience,
					issuer: this.authConfiguration.issuer,
				},
			);
			return {
				res,
				token,
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

	public async findUserByEmail(email: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (user) {
			return true;
		} else {
			return false;
		}
	}

	public async findUserByUsername(username: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				username,
			},
		});
		if (user) return true;

		return false;
	}

	public async verifyEmail(userId: string, otp: string) {
		const user = await this.prisma.user.findFirst({ where: { id: userId } });
		if (!user) throw new UnauthorizedException('User not found');
		if (user.emailVerified) return { message: 'Email already verified' };
		if (user.emailOtp !== otp) throw new UnauthorizedException('Invalid OTP');
		if (user.emailOtpExpiry && user.emailOtpExpiry < new Date()) {
			throw new UnauthorizedException('OTP has expired');
		}

		const isNowFullyVerified = user.phoneVerified; // If phone is already verified, this completes it

		await this.prisma.user.update({
			where: { id: user.id },
			data: { 
				emailVerified: true, 
				isverified: isNowFullyVerified,
				emailOtp: null, 
				emailOtpExpiry: null 
			},
		});

		if (isNowFullyVerified && !user.isverified) {
			// Send Notification only when fully verified for the first time
			await this.notificationService.createNotification({
				recipientId: user.id,
				recipientType: RecipientType.STUDENT,
				title: 'Account Verified!',
				message: 'Your account has been successfully verified. Welcome to Camproxi!',
				type: NotificationType.SUCCESS,
				category: NotificationCat.ACCOUNT_VERIFIED,
			});
		}

		return { message: 'Email verified successfully', isFullyVerified: isNowFullyVerified };
	}

	public async sendVerificationOtp(userId: string) {
		const user = await this.prisma.user.findFirst({ where: { id: userId } });
		if (!user) throw new UnauthorizedException('User not found');
		if (user.emailVerified) return { message: 'Email already verified' };

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		await this.prisma.user.update({
			where: { id: user.id },
			data: { emailOtp: otp, emailOtpExpiry: otpExpiry }
		});

		this.mailService.sendOtpEmail(user.email, otp, user.firstName).catch(console.error);

		return { message: 'OTP sent to email successfully' };
	}

	public async verifyPhone(userId: string, otp: string) {
		const user = await this.prisma.user.findFirst({ where: { id: userId } });
		if (!user) throw new UnauthorizedException('User not found');
		if (user.phoneVerified) return { message: 'Phone already verified' };
		if (user.phoneOtp !== otp) throw new UnauthorizedException('Invalid OTP');
		if (user.phoneOtpExpiry && user.phoneOtpExpiry < new Date()) {
			throw new UnauthorizedException('OTP has expired');
		}

		const isNowFullyVerified = user.emailVerified; // If email is already verified, this completes it

		await this.prisma.user.update({
			where: { id: user.id },
			data: { 
				phoneVerified: true, 
				isverified: isNowFullyVerified,
				phoneOtp: null, 
				phoneOtpExpiry: null 
			},
		});

		if (isNowFullyVerified && !user.isverified) {
			await this.notificationService.createNotification({
				recipientId: user.id,
				recipientType: RecipientType.STUDENT,
				title: 'Account Verified!',
				message: 'Your account has been successfully verified. Welcome to Camproxi!',
				type: NotificationType.SUCCESS,
				category: NotificationCat.ACCOUNT_VERIFIED,
			});
		}

		return { message: 'Phone verified successfully', isFullyVerified: isNowFullyVerified };
	}

	public async sendPhoneVerificationOtp(userId: string) {
		const user = await this.prisma.user.findFirst({ where: { id: userId } });
		if (!user) throw new UnauthorizedException('User not found');
		if (user.phoneVerified) return { message: 'Phone already verified' };
		if (!user.phone) throw new UnauthorizedException('No phone number attached to account');

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		await this.prisma.user.update({
			where: { id: user.id },
			data: { phoneOtp: otp, phoneOtpExpiry: otpExpiry }
		});
		// const phone

		this.smsService.sendOtpSms(user.phone, otp).catch(console.error);

		return { message: 'OTP sent to phone successfully' };
	}

	// public async findUserByEmail(email: string) {
	// 	const user = await this.prisma.user.findUnique({
	// 		where: {
	// 			email,
	// 		},
	// 	});
	// 	if (user) return true

	// 	return false
	// }
}
