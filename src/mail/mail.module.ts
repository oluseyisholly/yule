import { Module } from '@nestjs/common';
import * as postmark from 'postmark';
import { MailService } from './mail.service';

@Module({
  providers: [
    {
      provide: 'POSTMARK_CLIENT',
      useFactory: () => {
        return new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
