import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  // private readonly apiUrl = 'https://v4.api.termii.com/api/sms/number/send';
  // private readonly apiUrl = 'https://api.ng.termii.com/api/sms/number/send';

  async sendOtpSms(to: string, otp: string) {
    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID;
    const url =  'https://api.ng.termii.com/api/sms/send';

    if (!apiKey || !senderId) {
      console.warn('Termii API key or Sender ID not set in environment variables');
      return;
    }

    try {
      const data = {
        to,
        from: 'Generic',
        sms: `Your Camproxi verification code is: ${otp}. It will expire in 10 minutes.`,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      };
      console.log(data)

      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error('Error sending SMS via Termii:', error?.response?.data || error.message);
      // We log but don't throw to not completely break the flow if SMS fails
    }
  }
}
