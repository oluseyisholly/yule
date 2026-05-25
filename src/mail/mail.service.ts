import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServerClient } from 'postmark';
import { loadEmailTemplate } from 'src/utils/template-loader';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('POSTMARK_CLIENT')
    private readonly postmark: ServerClient,
  ) {}

  async sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    const html = loadEmailTemplate(options.template, options.context);

    await this.postmark.sendEmail({
      From: 'no-reply@yourdomain.com',
      To: options.to,
      Subject: options.subject,
      HtmlBody: html,
    });

    this.logger.log(`Email sent → ${options.to}`);
  }
}
