import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string, 
    emailFrom: string = process.env.EMAIL_FROM!,
  ): Promise<void> {

    await sgMail.send({
      to,
      from: emailFrom,
      subject,
      html: body,
    });
  }
}
