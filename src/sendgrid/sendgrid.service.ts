import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import ms from 'ms';
import { UserEntity } from 'src/user/entities';
import { AbsenceEntity } from 'src/absences/entities';

import { Templates } from './enum';

@Injectable()
export class SendgridService {
  private readonly sgMail: MailService;

  constructor(private readonly configService: ConfigService) {
    this.sgMail = new MailService();
    this.sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const mail: MailDataRequired = {
      from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      templateId: Templates.PasswordReset,
      personalizations: [
        {
          to: [
            {
              email,
            },
          ],
          dynamicTemplateData: {
            token,
            expireTime: ms(
              ms(
                this.configService.get<string>(
                  'PASSWORD_RESET_TOKEN_EXPIRATION',
                ),
              ),
              { long: true },
            ),
          },
        },
      ],
    };

    await this.sendEmail(mail);
  }

  async sendPasswordChange(email: string, token: string): Promise<void> {
    const mail: MailDataRequired = {
      from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      templateId: Templates.PasswordChange,
      personalizations: [
        {
          to: [
            {
              email,
            },
          ],
          dynamicTemplateData: {
            token,
            expireTime: ms(
              ms(
                this.configService.get<string>(
                  'PASSWORD_CHANGE_TOKEN_EXPIRATION',
                ),
              ),
              { long: true },
            ),
          },
        },
      ],
    };

    await this.sendEmail(mail);
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const mail: MailDataRequired = {
      from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      templateId: Templates.EmailVerification,
      personalizations: [
        {
          to: [
            {
              email,
            },
          ],
          dynamicTemplateData: {
            token,
          },
        },
      ],
    };

    await this.sendEmail(mail);
  }

  formatDate(date: Date) {
    return (
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    );
  }

  async sendAbsenceRequestedEmail(
    emails: string[],
    user: UserEntity,
    startDate: Date,
    endDate: Date,
    weekdaysCount: number,
  ) {
    const mails: MailDataRequired[] = [];

    for (let i = 0; i < emails.length; i++) {
      mails.push({
        from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
        templateId: Templates.AbsenceRequested,
        personalizations: [
          {
            to: [
              {
                email: emails[i],
              },
            ],
            dynamicTemplateData: {
              firstName: user.firstName,
              lastName: user.lastName,
              startDate: this.formatDate(startDate),
              endDate: this.formatDate(endDate),
              weekdaysCount,
            },
          },
        ],
      });
    }

    await this.sendEmail(mails);
  }

  async sendAbsenceApprovedEmail(absenceEntity: AbsenceEntity) {
    const mail: MailDataRequired = {
      from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      templateId: Templates.AbsenceApproved,
      personalizations: [
        {
          to: [
            {
              email: absenceEntity.user.email,
            },
          ],
          dynamicTemplateData: {
            firstName: absenceEntity.user.firstName,
            lastName: absenceEntity.user.lastName,
            startDate: this.formatDate(absenceEntity.startDate),
            endDate: this.formatDate(absenceEntity.endDate),
            weekdaysCount: absenceEntity.count,
          },
        },
      ],
    };

    await this.sendEmail(mail);
  }

  async sendAbsenceRejectedEmail(absenceEntity: AbsenceEntity) {
    const mail: MailDataRequired = {
      from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      templateId: Templates.AbsenceRejected,
      personalizations: [
        {
          to: [
            {
              email: absenceEntity.user.email,
            },
          ],
          dynamicTemplateData: {
            firstName: absenceEntity.user.firstName,
            lastName: absenceEntity.user.lastName,
            startDate: this.formatDate(absenceEntity.startDate),
            endDate: this.formatDate(absenceEntity.endDate),
            weekdaysCount: absenceEntity.count,
          },
        },
      ],
    };

    await this.sendEmail(mail);
  }

  async sendAbsenceApprovedDepartments(
    emails: string[],
    absenceEntity: AbsenceEntity,
  ) {
    const mails: MailDataRequired[] = [];

    for (let i = 0; i < emails.length; i++) {
      mails.push({
        from: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
        templateId: Templates.AbsenceApprovedDepartments,
        personalizations: [
          {
            to: [
              {
                email: emails[i],
              },
            ],
            dynamicTemplateData: {
              firstName: absenceEntity.user.firstName,
              lastName: absenceEntity.user.lastName,
              startDate: this.formatDate(absenceEntity.startDate),
              endDate: this.formatDate(absenceEntity.endDate),
              weekdaysCount: absenceEntity.count,
            },
          },
        ],
      });
    }

    await this.sendEmail(mails);
  }

  private async sendEmail(mail: MailDataRequired | MailDataRequired[]) {
    return await this.sgMail.send(mail);
  }
}
