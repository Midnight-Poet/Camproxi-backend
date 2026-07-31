import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  // Default sender for Camproxi (requires domain verification in Resend)
  private readonly defaultFrom = 'Camproxi <onboarding@resend.dev>'; 

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }

  async sendOtpEmail(to: string, otp: string, firstName: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: 'Camproxi - Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Welcome to Camproxi, ${firstName}!</h2>
            <p>Thank you for signing up. Please use the following 6-digit code to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
        return false;
      }

      this.logger.log(`Verification email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      return false;
    }
  }
}
