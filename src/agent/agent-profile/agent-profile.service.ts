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

@Injectable()
export class AgentProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly authService: AgentAuthService,
		private readonly cloudinary: CloudinaryService,
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
			secure: process.env.ENV_MODE === 'PROD',
			sameSite: 'lax',
			path: '/',
		});
		return { message: 'Logged out successfully' };
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
			secure: process.env.ENV_MODE === 'PROD',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
		});
	}
}
