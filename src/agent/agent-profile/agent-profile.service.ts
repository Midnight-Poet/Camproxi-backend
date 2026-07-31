import {
	Injectable,
	ConflictException,
	UnauthorizedException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AgentAuthService } from '../auth/agent-auth.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { LoginAgentDto } from './dto/login-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { MailService } from 'src/common/mail/mail.service';
import { SmsService } from 'src/common/sms/sms.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { RecipientType, NotificationType, NotificationCat } from '@prisma/client';

@Injectable()
export class AgentProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly authService: AgentAuthService,
		private readonly cloudinary: CloudinaryService,
		private readonly mailService: MailService,
		private readonly smsService: SmsService,
		private readonly notificationService: NotificationService,
	) {}

	async register(createAgentDto: CreateAgentDto, res: Response) {
		const { email, username, password, ...rest } = createAgentDto;
		const existingAgent = await this.prisma.agent.findFirst({
			where: { OR: [{ email }, { username }] },
		});
		if (existingAgent) {
			throw new ConflictException('Email or username already exists');
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const agent = await this.prisma.agent.create({
			data: { email, username, password: hashedPassword, ...rest },
		});

		const token = this.authService.generateToken(
			agent.id,
			agent.email,
			agent.category,
			agent.schoolId,
			agent.campusName
		);
		this.setTokenCookie(res, token);
		const { password: _, ...agentWithoutPassword } = agent;
		return {
			message: 'Agent registered successfully',
			agent: agentWithoutPassword,
		};
	}

	async login(loginAgentDto: LoginAgentDto, res: Response) {
		const { email, password } = loginAgentDto;
		const agent = await this.prisma.agent.findUnique({ where: { email } });
		if (!agent || !(await bcrypt.compare(password, agent.password))) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const token = this.authService.generateToken(
			agent.id,
			agent.email,
			agent.category,
			agent.schoolId,
			agent.campusName
		);
		this.setTokenCookie(res, token);
		const { password: _, ...agentWithoutPassword } = agent;
		return {
			message: 'Login successful',
			agent: agentWithoutPassword,
		};
	}

	logout(res: Response) {
		res.clearCookie('jwt', {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			path: '/',
		});
		return { message: 'Logged out successfully' };
	}

	async verifyEmail(agentId: string, otp: string) {
		const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
		if (!agent) throw new NotFoundException('Agent not found');
		if (agent.emailVerified) return { message: 'Email already verified' };
		if (agent.emailOtp !== otp) throw new UnauthorizedException('Invalid OTP');
		if (agent.emailOtpExpiry && agent.emailOtpExpiry < new Date()) {
			throw new UnauthorizedException('OTP has expired');
		}

		const isNowFullyVerified = agent.phoneVerified;

		await this.prisma.agent.update({
			where: { id: agent.id },
			data: { 
				emailVerified: true, 
				isverified: isNowFullyVerified,
				emailOtp: null, 
				emailOtpExpiry: null 
			},
		});

		if (isNowFullyVerified && !agent.isverified) {
			await this.notificationService.createNotification({
				recipientId: agent.id,
				recipientType: RecipientType.AGENT,
				title: 'Account Verified!',
				message: 'Your account has been successfully verified. You can now start listing your properties or products!',
				type: NotificationType.SUCCESS,
				category: NotificationCat.ACCOUNT_VERIFIED,
			});
		}

		return { message: 'Email verified successfully', isFullyVerified: isNowFullyVerified };
	}

	async sendVerificationOtp(agentId: string) {
		const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
		if (!agent) throw new NotFoundException('Agent not found');
		if (agent.emailVerified) return { message: 'Email already verified' };

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		await this.prisma.agent.update({
			where: { id: agent.id },
			data: { emailOtp: otp, emailOtpExpiry: otpExpiry },
		});

		this.mailService.sendOtpEmail(agent.email, otp, agent.firstName).catch(console.error);

		return { message: 'OTP sent to email successfully' };
	}

	async verifyPhone(agentId: string, otp: string) {
		const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
		if (!agent) throw new NotFoundException('Agent not found');
		if (agent.phoneVerified) return { message: 'Phone already verified' };
		if (agent.phoneOtp !== otp) throw new UnauthorizedException('Invalid OTP');
		if (agent.phoneOtpExpiry && agent.phoneOtpExpiry < new Date()) {
			throw new UnauthorizedException('OTP has expired');
		}

		const isNowFullyVerified = agent.emailVerified;

		await this.prisma.agent.update({
			where: { id: agent.id },
			data: { 
				phoneVerified: true, 
				isverified: isNowFullyVerified,
				phoneOtp: null, 
				phoneOtpExpiry: null 
			},
		});

		if (isNowFullyVerified && !agent.isverified) {
			await this.notificationService.createNotification({
				recipientId: agent.id,
				recipientType: RecipientType.AGENT,
				title: 'Account Verified!',
				message: 'Your account has been successfully verified. You can now start listing your properties or products!',
				type: NotificationType.SUCCESS,
				category: NotificationCat.ACCOUNT_VERIFIED,
			});
		}

		return { message: 'Phone verified successfully', isFullyVerified: isNowFullyVerified };
	}

	async sendPhoneVerificationOtp(agentId: string) {
		const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
		if (!agent) throw new NotFoundException('Agent not found');
		if (agent.phoneVerified) return { message: 'Phone already verified' };
		if (!agent.phone) throw new UnauthorizedException('No phone number attached to account');

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

		await this.prisma.agent.update({
			where: { id: agent.id },
			data: { phoneOtp: otp, phoneOtpExpiry: otpExpiry },
		});

		this.smsService.sendOtpSms(agent.phone, otp).catch(console.error);

		return { message: 'OTP sent to phone successfully' };
	}

	async getAgentProfile(agentId: string) {
		const agent = await this.prisma.agent.findUnique({
			where: { id: agentId },
		});
		if (!agent) {
			throw new NotFoundException('Agent not found');
		}
		const { password: _, ...agentWithoutPassword } = agent;
		return agentWithoutPassword;
	}

	async getStudentProfile(studentId: string) {
		const student = await this.prisma.user.findFirst({
			where: { id: studentId },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				email: true,
				bio: true,
				profileImage: true,
				campusName: true,
				isverified: true,
				school: {
					select: { id: true, name: true, code: true, campus: true }
				}
			}
		});
		if (!student) throw new NotFoundException('Student not found');
		return student;
	}

	async updateProfile(
		agentId: string,
		updateAgentDto: UpdateAgentDto,
		profileImage?: { url: string; public_id: string },
	) {
		const updatedData: any = { ...updateAgentDto };
		// if (profileImage) {
		// 	data.profileImage = profileImage;
		// }
		if (updateAgentDto.socialLinks) {
			try {
				updatedData.socialLinks =
					typeof updateAgentDto.socialLinks === 'string'
						? JSON.parse(updateAgentDto.socialLinks)
						: updateAgentDto.socialLinks;
			} catch (e) {
				updatedData.socialLinks = {};
			}
		}
		try {
			const updatedAgent = await this.prisma.agent.update({
				where: { id: agentId },
				data: {
					...updatedData,
					profileImage: {
						set: {
							url: profileImage.url,
							publicId: profileImage.public_id
						},
					},
				},
			});
			const { password: _, ...agentWithoutPassword } = updatedAgent;
			return {
				message: 'Profile updated successfully',
				agent: agentWithoutPassword,
			};
		} catch (error) {
			// console.log(error)
			await this.cloudinary.rollbackSingleFile(profileImage.public_id)
			throw new BadRequestException(error);
		}
	}

	async deleteAgentAccount(agentId: string) {
		const agent = await this.prisma.agent.findUnique({
			where: { id: agentId },
		});
		if (!agent) {
			throw new NotFoundException('Agent not found');
		}
		await this.prisma.property.deleteMany({ where: { agentId } });
		await this.prisma.product.deleteMany({ where: { agentId } });
		await this.prisma.service.deleteMany({ where: { agentId } });
		await this.prisma.agent.delete({ where: { id: agentId } });
		return { message: 'Account deleted' };
	}

	private setTokenCookie(res: Response, token: string) {
		res.cookie('jwt', token, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: 2 * 24 * 60 * 60 * 1000,
			path: '/',
		});
	}
}
