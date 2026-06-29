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
  SendGiftingEventInvitationsDto,
  SendInvitationDto,
  SendInvitationsResponseDto,
  SendWishlistEventInvitationsDto,
} from 'src/dtos/invitation.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
import {
  EventParticipant,
  EventParticipantRole,
} from 'src/entities/event-participant.entity';
import {
  Invitation,
  InvitationChannel,
  InvitationEventType,
  InvitationStatus,
} from 'src/entities/invitation.entity';
import { DrawNameEventRepository } from 'src/repositories/draw-name-event.repository';
import { EventContactRepository } from 'src/repositories/event-contact.repository';
import { GiftingEventRepository } from 'src/repositories/gifting-event.repository';
import { InvitationRepository } from 'src/repositories/invitation.repository';
import { ParticipantRepository } from 'src/repositories/participant.repository';
import { UserRepository } from 'src/repositories/user.repositoty';
import { WishlistEventRepository } from 'src/repositories/wishlist-event.repository';
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

type CreateInvitationContext = {
  eventType: InvitationEventType;
  eventId: string;
  eventTitle?: string;
  drawNameEventId?: string | null;
  wishlistEventId?: string | null;
  giftingEventId?: string | null;
  participant?: EventParticipant;
  contact: Contact;
  channel: InvitationChannel;
  ownerContactId: string;
};

@Injectable()
export class InvitationService {
  private readonly saltRounds = 10;

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly drawNameEventRepository: DrawNameEventRepository,
    private readonly wishlistEventRepository: WishlistEventRepository,
    private readonly giftingEventRepository: GiftingEventRepository,
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
        if (!participant.eventContact) {
          throw new BadRequestException('Participant does not have a contact');
        }

        const invitation = await this.createAndSendInvitation({
          eventType: InvitationEventType.DRAW_NAME,
          eventId: drawNameEvent.eventId,
          eventTitle: drawNameEvent.event?.title,
          drawNameEventId: drawNameEvent.id,
          participant,
          contact: participant.eventContact,
          channel: sendInvitationDto.channel,
          ownerContactId,
        });

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

  async sendWishlistEventInvitations(
    wishlistEventId: string,
    sendInvitationDto: SendWishlistEventInvitationsDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const wishlistEvent = await this.wishlistEventRepository.findByIdForUser(
      wishlistEventId,
      ownerContactId,
    );

    if (!wishlistEvent) {
      throw new NotFoundException('Wishlist event not found');
    }

    const data = await this.sendContactInvitations({
      eventType: InvitationEventType.WISHLIST,
      eventId: wishlistEvent.eventId,
      eventTitle: wishlistEvent.event?.title,
      wishlistEventId: wishlistEvent.id,
      contactIds: sendInvitationDto.contactIds,
      channel: sendInvitationDto.channel,
      ownerContactId,
    });

    return {
      code: HttpStatus.OK,
      message: 'Invitations sent successfully',
      data,
    };
  }

  async sendGiftingEventInvitations(
    giftingEventId: string,
    sendInvitationDto: SendGiftingEventInvitationsDto,
  ): Promise<StandardResopnse<SendInvitationsResponseDto>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const giftingEvent = await this.giftingEventRepository.findByIdForUser(
      giftingEventId,
      ownerContactId,
    );

    if (!giftingEvent) {
      throw new NotFoundException('Gifting event not found');
    }

    const data = await this.sendContactInvitations({
      eventType: InvitationEventType.GIFTING,
      eventId: giftingEvent.eventId,
      eventTitle: giftingEvent.event?.title,
      giftingEventId: giftingEvent.id,
      contactIds: sendInvitationDto.contactIds,
      channel: sendInvitationDto.channel,
      ownerContactId,
    });

    return {
      code: HttpStatus.OK,
      message: 'Invitations sent successfully',
      data,
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

    if (!participant.eventContact) {
      throw new BadRequestException('Participant does not have a contact');
    }

    const invitation = await this.createAndSendInvitation({
      eventType: InvitationEventType.DRAW_NAME,
      eventId: drawNameEvent.eventId,
      eventTitle: drawNameEvent.event?.title,
      drawNameEventId: drawNameEvent.id,
      participant,
      contact: participant.eventContact,
      channel: sendInvitationDto.channel,
      ownerContactId,
    });

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

    return this.findEventInvitations(
      drawNameEvent.id,
      ownerContactId,
      InvitationEventType.DRAW_NAME,
      query,
      'drawNameEventId',
    );
  }

  async findWishlistEventInvitations(
    wishlistEventId: string,
    query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const wishlistEvent = await this.wishlistEventRepository.findByIdForUser(
      wishlistEventId,
      ownerContactId,
    );

    if (!wishlistEvent) {
      throw new NotFoundException('Wishlist event not found');
    }

    return this.findEventInvitations(
      wishlistEvent.id,
      ownerContactId,
      InvitationEventType.WISHLIST,
      query,
      'wishlistEventId',
    );
  }

  async findGiftingEventInvitations(
    giftingEventId: string,
    query: FindInvitationsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const giftingEvent = await this.giftingEventRepository.findByIdForUser(
      giftingEventId,
      ownerContactId,
    );

    if (!giftingEvent) {
      throw new NotFoundException('Gifting event not found');
    }

    return this.findEventInvitations(
      giftingEvent.id,
      ownerContactId,
      InvitationEventType.GIFTING,
      query,
      'giftingEventId',
    );
  }

  async findInvitationByToken(
    token: string,
  ): Promise<
    StandardResopnse<InvitationResponseDto & { redirectPath: string }>
  > {
    const invitation = await this.getInvitationByTokenOrThrow(token);

    return {
      code: HttpStatus.OK,
      message: 'Invitation fetched successfully',
      data: {
        ...this.toInvitationResponse(invitation),
        redirectPath: this.getRedirectPath(invitation),
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
    const existingUser =
      await this.userRepository.findUserByEmail(normalizedEmail);

    if (contact.userId && existingUser && contact.userId !== existingUser.id) {
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
    const invitationWithParticipant = await this.ensureInvitationParticipant(
      invitation,
      linkedContact,
    );
    const acceptedInvitation =
      invitationWithParticipant.status === InvitationStatus.ACCEPTED
        ? invitationWithParticipant
        : await this.invitationRepository.markAccepted(
            invitationWithParticipant.id,
          );

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
        redirectPath: this.getRedirectPath(acceptedInvitation),
      },
    };
  }

  private async sendContactInvitations(params: {
    eventType: InvitationEventType;
    eventId: string;
    eventTitle?: string;
    wishlistEventId?: string;
    giftingEventId?: string;
    contactIds: string[];
    channel: InvitationChannel;
    ownerContactId: string;
  }): Promise<SendInvitationsResponseDto> {
    const contactIds = Array.from(new Set(params.contactIds)).filter(
      (contactId) => contactId !== params.ownerContactId,
    );
    const contacts = await this.participantRepository.findContactsByIdsForUser(
      contactIds,
      params.ownerContactId,
    );
    const contactsById = new Map(
      contacts.map((contact) => [contact.id, contact]),
    );
    const sent: InvitationResponseDto[] = [];
    const skipped: SendInvitationsResponseDto['skipped'] = [];

    for (const contactId of contactIds) {
      const contact = contactsById.get(contactId);

      if (!contact) {
        skipped.push({
          contactId,
          reason: 'Contact not found for current user',
        });
        continue;
      }

      try {
        const invitation = await this.createAndSendInvitation({
          eventType: params.eventType,
          eventId: params.eventId,
          eventTitle: params.eventTitle,
          wishlistEventId: params.wishlistEventId,
          giftingEventId: params.giftingEventId,
          contact,
          channel: params.channel,
          ownerContactId: params.ownerContactId,
        });

        sent.push(this.toInvitationResponse(invitation));
      } catch (error) {
        skipped.push({
          contactId,
          reason:
            error instanceof Error
              ? error.message
              : 'Invitation could not be sent',
        });
      }
    }

    return { sent, skipped };
  }

  private async findEventInvitations(
    eventTypeId: string,
    ownerContactId: string,
    eventType: InvitationEventType,
    query: FindInvitationsQueryDto,
    eventTypeColumn: 'drawNameEventId' | 'wishlistEventId' | 'giftingEventId',
  ): Promise<StandardResopnse<PaginatedRecordsDto<InvitationResponseDto>>> {
    const invitations = await this.invitationRepository.findAllForEvent(
      eventTypeId,
      ownerContactId,
      eventType,
      query,
      eventTypeColumn,
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

  private async createAndSendInvitation(
    context: CreateInvitationContext,
  ): Promise<Invitation> {
    this.ensureContactIsNotOwner(context.contact.id, context.ownerContactId);
    this.ensureContactCanReceiveInvite(context.contact, context.channel);

    const token = randomBytes(32).toString('hex');
    const inviteUrl = this.buildInviteUrl(token, context);
    const invitation = await this.invitationRepository.createOrReuse({
      eventType: context.eventType,
      drawNameEventId: context.drawNameEventId,
      wishlistEventId: context.wishlistEventId,
      giftingEventId: context.giftingEventId,
      eventId: context.eventId,
      participantId: context.participant?.id ?? null,
      eventContactId: context.contact.id,
      token,
      channel: context.channel,
      inviteUrl,
      createdById: context.ownerContactId,
    });

    if (context.channel === InvitationChannel.EMAIL) {
      await this.emailService.sendEmail({
        to: context.contact.email!,
        subject: this.getInvitationSubject(context.eventType),
        html: this.buildInvitationEmailHtml(invitation, context.eventTitle),
        text: `${this.getInvitationText(context.eventType)} Open this link to continue: ${invitation.inviteUrl}`,
      });
    }

    return invitation;
  }

  private ensureContactCanReceiveInvite(
    contact: Contact,
    channel: InvitationChannel,
  ) {
    if (channel === InvitationChannel.EMAIL && !contact.email) {
      throw new BadRequestException('Contact email is missing');
    }

    if (channel === InvitationChannel.WHATSAPP && !contact.phoneNumber) {
      throw new BadRequestException('Contact phone number is missing');
    }
  }

  private ensureContactIsNotOwner(contactId: string, ownerContactId: string) {
    if (contactId === ownerContactId) {
      throw new BadRequestException(
        'You cannot send an invitation to yourself',
      );
    }
  }

  private async ensureInvitationParticipant(
    invitation: Invitation,
    contact: Contact,
  ): Promise<Invitation> {
    if (invitation.participantId) {
      return invitation;
    }

    if (
      ![InvitationEventType.WISHLIST, InvitationEventType.GIFTING].includes(
        invitation.eventType,
      )
    ) {
      return invitation;
    }

    const existingParticipant =
      await this.participantRepository.findByEventIdAndContactId(
        invitation.eventId,
        contact.id,
      );
    const participant =
      existingParticipant ??
      (await this.participantRepository.create({
        eventId: invitation.eventId,
        eventContactId: contact.id,
        role: EventParticipantRole.PARTICIPANT,
        isNotified: false,
        isPairActive: false,
      }));

    return this.invitationRepository.linkParticipant(
      invitation.id,
      participant.id,
    );
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

  private buildInviteUrl(
    token: string,
    context: CreateInvitationContext,
  ): string {
    if (
      context.eventType === InvitationEventType.DRAW_NAME &&
      context.drawNameEventId
    ) {
      return this.buildViktriSignInUrl(
        this.buildFrontendUrl(
          `/dashboard/draw-names/${context.drawNameEventId}`,
        ),
      );
    }

    if (context.eventType === InvitationEventType.GIFTING) {
      return this.buildViktriSignInUrl(
        this.buildFrontendUrl('/dashboard/gifts?tab=events'),
      );
    }

    return `${configService.getFrontendBaseUrl().replace(/\/$/, '')}/invite/${token}`;
  }

  private buildFrontendUrl(path: string): string {
    return `${configService.getFrontendBaseUrl().replace(/\/$/, '')}${path}`;
  }

  private buildViktriSignInUrl(redirectUrl: string): string {
    const url = new URL(configService.getViktriSignInUrl());
    url.searchParams.set('redirectUrl', redirectUrl);

    return url.toString();
  }

  private getRedirectPath(invitation: Invitation): string {
    if (
      invitation.eventType === InvitationEventType.DRAW_NAME &&
      invitation.drawNameEventId
    ) {
      return `/dashboard/draw-names/${invitation.drawNameEventId}`;
    }

    if (
      invitation.eventType === InvitationEventType.WISHLIST &&
      invitation.wishlistEventId
    ) {
      return `/dashboard/wishlist-events/${invitation.wishlistEventId}`;
    }

    if (
      invitation.eventType === InvitationEventType.GIFTING &&
      invitation.giftingEventId
    ) {
      return '/dashboard/gifts?tab=events';
    }

    return `/dashboard/events/${invitation.eventId}`;
  }

  private getInvitationSubject(eventType: InvitationEventType): string {
    if (eventType === InvitationEventType.DRAW_NAME) {
      return 'Access your Yule draw name activity';
    }

    return `You have been invited to ${this.getInvitationEventLabel(eventType)}`;
  }

  private getInvitationText(eventType: InvitationEventType): string {
    if (eventType === InvitationEventType.DRAW_NAME) {
      return 'Log in to Viktri to access Yule and continue to your draw name activity.';
    }

    return `You have been invited to join ${this.getInvitationEventLabel(eventType)}.`;
  }

  private getInvitationEventLabel(eventType: InvitationEventType): string {
    switch (eventType) {
      case InvitationEventType.WISHLIST:
        return 'a wishlist event';
      case InvitationEventType.GIFTING:
        return 'a gifting event';
      case InvitationEventType.DRAW_NAME:
      default:
        return 'a draw name event';
    }
  }

  private buildInvitationEmailHtml(
    invitation: Invitation,
    eventTitle?: string,
  ): string {
    const title = eventTitle ?? invitation.event?.title ?? 'your event';

    if (invitation.eventType === InvitationEventType.DRAW_NAME) {
      return `
        <p>Hello,</p>
        <p>You have been invited to join the draw name activity <strong>${title}</strong> on Yule.</p>
        <p>Log in to Viktri to access Yule and continue to this draw name activity.</p>
        <p>If you are already logged in, you can continue directly to Yule.</p>
        <p><a href="${invitation.inviteUrl}">Continue to Yule</a></p>
        <p>If the button does not work, copy this link into your browser: ${invitation.inviteUrl}</p>
      `;
    }

    return `
      <p>Hello,</p>
      <p>You have been invited to join <strong>${title}</strong>.</p>
      <p><a href="${invitation.inviteUrl}">Accept your invitation</a></p>
      <p>If the button does not work, copy this link into your browser: ${invitation.inviteUrl}</p>
    `;
  }

  private toInvitationResponse(invitation: Invitation): InvitationResponseDto {
    return {
      id: invitation.id,
      eventType: invitation.eventType,
      drawNameEventId: invitation.drawNameEventId,
      wishlistEventId: invitation.wishlistEventId,
      giftingEventId: invitation.giftingEventId,
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
      profileUrl: contact.profileUrl,
    };
  }
}
