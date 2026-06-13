import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

type EmailAttachment = {
  filename?: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
};

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
};

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string;

  constructor() {
    const host = this.getRequiredEnv('MAIL_HOST');
    const port = Number(this.getRequiredEnv('MAIL_PORT'));
    const user = this.getRequiredEnv('MAIL_USER');
    const pass = this.getRequiredEnv('MAIL_PASS');

    if (Number.isNaN(port)) {
      throw new Error('MAIL_PORT must be a valid number');
    }

    this.defaultFrom = process.env.MAIL_FROM || user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,

      // Connection pool for production workloads
      pool: true,
      maxConnections: 5,
      maxMessages: 100,

      auth: {
        user,
        pass,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error(
        'Failed to verify SMTP connection',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendEmail(options: SendEmailOptions) {
    if (!options.html && !options.text) {
      throw new Error('Email requires either html or text content');
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent successfully. Message ID: ${info.messageId}`);

      return info;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${this.formatRecipients(options.to)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async verifyConnection() {
    return this.transporter.verify();
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required email configuration: ${key}`);
    }

    return value;
  }

  private formatRecipients(recipients: string | string[]) {
    return Array.isArray(recipients) ? recipients.join(', ') : recipients;
  }
}
