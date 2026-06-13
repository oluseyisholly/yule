import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import { configService } from 'src/config/config.service';
import {
  ClaimInvitationDto,
  FindInvitationsQueryDto,
  InvitationContactResponseDto,
  InvitationResponseDto,
  SendInvitationDto,
  SendInvitationsResponseDto,
} from 'src/dtos/invitation.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
import { EventParticipant } from 'src/entities/event-participant.entity';
import {
  Invitation,
  InvitationChannel,
  InvitationStatus,
} from 'src/entities/invitation.entity';
import { DrawNameEventRepository } from 'src/repositories/draw-name-event.repository';
import { EventContactRepository } from 'src/repositories/event-contact.repository';
import { InvitationRepository } from 'src/repositories/invitation.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';
import { UserRepository } from 'src/repositories/user.repositoty';
import { EmailService } from './email.service';

type ClaimInvitationResponse = {
  invitation: InvitationResponseDto;
  contact: InvitationContactResponseDto;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  redirectPath: string;
};

@Injectable()
export class InvitationService {
  private readonly saltRounds = 10;

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly drawNameEventRepository: DrawNameEventRepository,
    private readonly participantRepository: ParticipantRepository,
    private readonly eventContactRepository: EventContactRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async sendDrawNameEventInvitations(
    drawNameEventId: string,
    sendInvitationDto: SendInvitationDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const drawNameEvent = await this.drawNameEventRepository.findByIdForUser(
      drawNameEventId,
      ownerContactId,
    );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const participants =
      await this.participantRepository.findParticipantsForInvitations(
        drawNameEvent.eventId,
        ownerContactId,
      );
    const sent: InvitationResponseDto[] = [];
    const skipped: SendInvitationsResponseDto['skipped'] = [];

    for (const participant of participants) {
      try {
        const invitation = await this.createAndSendInvitation(
          drawNameEvent.id,
          participant,
          sendInvitationDto.channel,
          ownerContactId,
        );

        sent.push(this.toInvitationResponse(invitation));
      } catch (error) {
        skipped.push({
          participantId: participant.id,
          reason:
            error instanceof Error
              ? error.message
              : 'Invitation could not be sent',
        });
      }
    }

    return {
      code: HttpStatus.OK,
      message: 'Invitations sent successfully',
      data: { sent, skipped },
    };
  }

  async sendParticipantInvitation(
    participantId: string,
    sendInvitationDto: SendInvitationDto,
  ): Promise<StandardResopnse<InvitationResponseDto>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const participant = await this.participantRepository.findByIdForUser(
      participantId,
      ownerContactId,
    );

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const drawNameEvent = await this.drawNameEventRepository.findByEventId(
      participant.eventId,
      ownerContactId,
    );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const invitation = await this.createAndSendInvitation(
      drawNameEvent.id,
      participant,
      sendInvitationDto.channel,
      ownerContactId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Invitation sent successfully',
      data: this.toInvitationResponse(invitation),
    };
  }

  async findDrawNameEventInvitations(
    drawNameEventId: string,
    query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const drawNameEvent = await this.drawNameEventRepository.findByIdForUser(
      drawNameEventId,
      ownerContactId,
    );

    if (!drawNameEvent) {
      throw new NotFoundException('Draw name event not found');
    }

    const invitations =
      await this.invitationRepository.findAllForDrawNameEvent(
        drawNameEvent.id,
        ownerContactId,
        query,
      );

    return {
      code: HttpStatus.OK,
      message: 'Invitations fetched successfully',
      data: {
        ...invitations,
        data: invitations.data.map((invitation) =>
          this.toInvitationResponse(invitation),
        ),
      },
    };
  }

  async findInvitationByToken(
    token: string,
  ): Promise<StandardResopnse<InvitationResponseDto & { redirectPath: string }>> {
    const invitation = await this.getInvitationByTokenOrThrow(token);

    return {
      code: HttpStatus.OK,
      message: 'Invitation fetched successfully',
      data: {
        ...this.toInvitationResponse(invitation),
        redirectPath: this.getRedirectPath(invitation.drawNameEventId),
      },
    };
  }

  async claimInvitation(
    token: string,
    claimInvitationDto: ClaimInvitationDto,
  ): Promise<StandardResopnse<ClaimInvitationResponse>> {
    const invitation = await this.getInvitationByTokenOrThrow(token);
    const contact = this.getInvitationContactOrThrow(invitation);

    if (!contact.email) {
      throw new BadRequestException('Invitation contact email is missing');
    }

    const normalizedEmail = contact.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findUserByEmail(
      normalizedEmail,
    );

    if (
      contact.userId &&
      existingUser &&
      contact.userId !== existingUser.id
    ) {
      throw new ConflictException(
        'This invitation contact is already linked to a different user',
      );
    }

    const user =
      existingUser ??
      (await this.userRepository.createUser({
        firstName: claimInvitationDto.firstName,
        lastName: claimInvitationDto.lastName,
        phoneNumber: contact.phoneNumber ?? '',
        email: normalizedEmail,
        password: await bcrypt.hash(
          claimInvitationDto.password,
          this.saltRounds,
        ),
      }));

    const linkedContact =
      contact.userId === user.id
        ? contact
        : await this.eventContactRepository.linkContactToUser(
            contact.id,
            user.id,
          );
    const acceptedInvitation =
      invitation.status === InvitationStatus.ACCEPTED
        ? invitation
        : await this.invitationRepository.markAccepted(invitation.id);

    return {
      code: HttpStatus.OK,
      message: 'Invitation claimed successfully',
      data: {
        invitation: this.toInvitationResponse(acceptedInvitation),
        contact: this.toContactResponse(linkedContact),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        redirectPath: this.getRedirectPath(invitation.drawNameEventId),
      },
    };
  }

  private async createAndSendInvitation(
    drawNameEventId: string,
    participant: EventParticipant,
    channel: InvitationChannel,
    ownerContactId: string,
  ): Promise<Invitation> {
    const contact = participant.eventContact;
    this.ensureParticipantCanReceiveInvite(participant, channel);

    const token = randomBytes(32).toString('hex');
    const inviteUrl = this.buildInviteUrl(token);
    const invitation =
      await this.invitationRepository.createOrReuseForParticipant({
        drawNameEventId,
        eventId: participant.eventId,
        participantId: participant.id,
        eventContactId: participant.eventContactId ?? null,
        token,
        channel,
        inviteUrl,
        createdById: ownerContactId,
      });

    if (channel === InvitationChannel.EMAIL) {
      await this.emailService.sendEmail({
        to: contact!.email!,
        subject: 'You have been invited to a draw name event',
        html: this.buildInvitationEmailHtml(invitation),
        text: `You have been invited to a draw name event. Open this link to continue: ${invitation.inviteUrl}`,
      });
    }

    return invitation;
  }

  private ensureParticipantCanReceiveInvite(
    participant: EventParticipant,
    channel: InvitationChannel,
  ) {
    if (!participant.eventContact) {
      throw new BadRequestException('Participant does not have a contact');
    }

    if (channel === InvitationChannel.EMAIL && !participant.eventContact.email) {
      throw new BadRequestException('Participant contact email is missing');
    }

    if (
      channel === InvitationChannel.WHATSAPP &&
      !participant.eventContact.phoneNumber
    ) {
      throw new BadRequestException(
        'Participant contact phone number is missing',
      );
    }
  }

  private async getInvitationByTokenOrThrow(
    token: string,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  private getInvitationContactOrThrow(invitation: Invitation): Contact {
    if (!invitation.eventContact) {
      throw new BadRequestException('Invitation contact is missing');
    }

    return invitation.eventContact;
  }

  private buildInviteUrl(token: string): string {
    return `${configService.getFrontendBaseUrl().replace(/\/$/, '')}/invite/${token}`;
  }

  private getRedirectPath(drawNameEventId: string): string {
    return `/dashboard/draw-names/${drawNameEventId}`;
  }

  private buildInvitationEmailHtml(invitation: Invitation): string {
    const eventTitle = invitation.event?.title ?? 'your draw name event';

    return `
      <p>Hello,</p>
      <p>You have been invited to join <strong>${eventTitle}</strong>.</p>
      <p><a href="${invitation.inviteUrl}">Accept your invitation</a></p>
      <p>If the button does not work, copy this link into your browser: ${invitation.inviteUrl}</p>
    `;
  }

  private toInvitationResponse(invitation: Invitation): InvitationResponseDto {
    return {
      id: invitation.id,
      drawNameEventId: invitation.drawNameEventId,
      eventId: invitation.eventId,
      participantId: invitation.participantId,
      eventContactId: invitation.eventContactId,
      status: invitation.status,
      channel: invitation.channel,
      inviteUrl: invitation.inviteUrl,
      eventTitle: invitation.event?.title,
      eventContact: invitation.eventContact
        ? this.toContactResponse(invitation.eventContact)
        : null,
      sentAt: invitation.sentAt,
      acceptedAt: invitation.acceptedAt,
    };
  }

  private toContactResponse(contact: Contact): InvitationContactResponseDto {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
    };
  }
}
