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
    emailFrom: string,
  ): Promise<void> {

    await sgMail.send({
      to,
      from: emailFrom,
      subject,
      html: body,
    });
  }
}
