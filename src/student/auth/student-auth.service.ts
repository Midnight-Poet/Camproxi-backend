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
					expiresIn: this.authConfiguration.expiresIn,
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
					expiresIn: this.authConfiguration.expiresIn,
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
