import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly emailFrom: string;

  constructor(configService: ConfigService) {
    const apiKey = configService.get<string>('SENDGRID_API_KEY');

    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY não configurado');
    }

    const emailFrom = configService.get<string>('EMAIL_FROM');

    if (!emailFrom) {
      throw new Error('EMAIL_FROM não configurado');
    }

    sgMail.setApiKey(apiKey);
    this.emailFrom = emailFrom;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await sgMail.send({
      to,
      from: this.emailFrom,
      subject,
      html: body,
    });
  }
}
