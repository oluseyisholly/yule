import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  CreateEventContactDto,
  FindEventContactsQueryDto,
  SyncEventContactDto,
  UpdateEventContactDto,
} from 'src/dtos/event-contact.dto';
import { DeleteResponseDto, PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Contact } from 'src/entities/contact.entity';
import {
  AuthContactPayload,
  EventContactRepository,
} from 'src/repositories/event-contact.repository';

type AuthUserPayload = {
  sub?: string;
  id?: string;
  profileId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

@Injectable()
export class EventContactService {
  constructor(
    private readonly eventContactRepository: EventContactRepository,
  ) {}

  async createEventContact(
    createEventContactDto: CreateEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const existingContact = await this.eventContactRepository.findByEmail(
      createEventContactDto.email,
    );

    await this.ensurePhoneNumberIsAvailable(
      createEventContactDto.phoneNumber,
      existingContact?.id,
    );

    if (existingContact) {
      await this.eventContactRepository.ensureContactConnection(
        ownerContactId,
        existingContact.id,
      );

      return {
        code: HttpStatus.CREATED,
        message: 'Event contact created successfully',
        data: existingContact,
      };
    }

    const contact = await this.eventContactRepository.createEventContact(
      createEventContactDto,
      ownerContactId,
    );

    return {
      code: HttpStatus.CREATED,
      message: 'Event contact created successfully',
      data: contact,
    };
  }

  async syncEventContact(
    syncEventContactDto: SyncEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const existingContactByEmail =
      await this.eventContactRepository.findByEmail(syncEventContactDto.email);
    const existingContactByUserId =
      await this.eventContactRepository.findByUserId(
        syncEventContactDto.userId,
      );
    const contactToSync = existingContactByEmail ?? existingContactByUserId;

    // await this.ensurePhoneNumberIsAvailable(
    //   syncEventContactDto.phoneNumber,
    //   contactToSync?.id,
    // );

    await this.ensureEmailAndUserIdDoNotBelongToDifferentContacts(
      existingContactByEmail?.id,
      existingContactByUserId?.id,
    );

    if (contactToSync) {
      const updatedContact =
        await this.eventContactRepository.updateEventContact(
          contactToSync.id,
          syncEventContactDto,
          ownerContactId,
        );

      await this.eventContactRepository.ensureContactConnection(
        ownerContactId,
        updatedContact.id,
      );

      return {
        code: HttpStatus.OK,
        message: 'Event contact synced successfully',
        data: updatedContact,
      };
    }

    const contact = await this.eventContactRepository.createEventContact(
      syncEventContactDto,
      ownerContactId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Event contact synced successfully',
      data: contact,
    };
  }

  async updateEventContact(
    id: string,
    updateEventContactDto: UpdateEventContactDto,
  ): Promise<StandardResopnse<Contact>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const contact = await this.getConnectedContactOrThrow(id, ownerContactId);

    await this.ensurePhoneNumberIsAvailable(
      updateEventContactDto.phoneNumber,
      contact.id,
    );

    const updatedContact = await this.eventContactRepository.updateEventContact(
      contact.id,
      updateEventContactDto,
      ownerContactId,
    );

    return {
      code: HttpStatus.OK,
      message: 'Event contact updated successfully',
      data: updatedContact,
    };
  }

  async deleteEventContact(
    id: string,
  ): Promise<StandardResopnse<DeleteResponseDto>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const contact = await this.getConnectedContactOrThrow(id, ownerContactId);

    if (contact.id === ownerContactId) {
      throw new BadRequestException('You cannot delete your own contact');
    }

    await this.eventContactRepository.deleteEventContact(contact.id);

    return {
      code: HttpStatus.OK,
      message: 'Event contact deleted successfully',
      data: { id },
    };
  }

  async ensureCurrentUserContact(): Promise<StandardResopnse<Contact>> {
    const contact = await this.ensureCurrentUserContactEntity();

    return {
      code: HttpStatus.OK,
      message: 'Logged-in user contact ensured successfully',
      data: contact,
    };
  }

  async getCurrentContactId(): Promise<
    StandardResopnse<{ contactId: string }>
  > {
    const contact = await this.ensureCurrentUserContactEntity();

    return {
      code: HttpStatus.OK,
      message: 'Current contact id fetched successfully',
      data: { contactId: contact.id },
    };
  }

  async ensureCurrentUserContactEntity(
    userId?: string,
    authUser?: AuthUserPayload,
  ): Promise<Contact> {
    const currentContactId = RequestContext.get('currentContactId');

    if (!userId && currentContactId) {
      const currentContact =
        await this.eventContactRepository.findById(currentContactId);

      if (currentContact) {
        return currentContact;
      }
    }

    const currentUserId = userId ?? RequestContext.getCurrentUserId();
    const existingContact =
      await this.eventContactRepository.findByUserId(currentUserId);

    if (existingContact) {
      RequestContext.set('currentContactId', existingContact.id);

      return existingContact;
    }

    const existingEmailContact = authUser?.email
      ? await this.eventContactRepository.findByEmail(authUser.email)
      : null;

    if (existingEmailContact) {
      if (
        existingEmailContact.userId &&
        existingEmailContact.userId !== currentUserId
      ) {
        throw new ConflictException(
          'A contact with this email is already linked to another profile',
        );
      }

      const linkedContact = existingEmailContact.userId
        ? existingEmailContact
        : await this.eventContactRepository.linkContactToUser(
            existingEmailContact.id,
            currentUserId,
          );

      RequestContext.set('currentContactId', linkedContact.id);

      return linkedContact;
    }

    const contact =
      await this.eventContactRepository.createContactFromAuthPayload(
        this.toAuthContactPayload(currentUserId, authUser),
      );

    RequestContext.set('currentContactId', contact.id);

    return contact;
  }

  private toAuthContactPayload(
    userId: string,
    authUser?: AuthUserPayload,
  ): AuthContactPayload {
    return {
      userId,
      firstName: authUser?.firstName,
      lastName: authUser?.lastName,
      email: authUser?.email?.toLowerCase(),
      phoneNumber: authUser?.phoneNumber,
    };
  }

  async findAllEventContacts(
    query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    const paginatedContacts =
      await this.eventContactRepository.findAllEventContacts(query);

    return {
      code: HttpStatus.OK,
      message: 'Event contacts fetched successfully',
      data: paginatedContacts,
    };
  }

  async findAllEventContactsExcludingMe(
    query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const paginatedContacts =
      await this.eventContactRepository.findAllEventContacts(
        query,
        currentContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Event contacts fetched successfully',
      data: paginatedContacts,
    };
  }

  async findMyEventContacts(
    query: FindEventContactsQueryDto,
  ): Promise<StandardResopnse<PaginatedRecordsDto<Contact>>> {
    const ownerContactId = RequestContext.getCurrentContactId();
    const paginatedContacts =
      await this.eventContactRepository.findMyEventContacts(
        query,
        ownerContactId,
      );

    return {
      code: HttpStatus.OK,
      message: 'Logged-in user contacts fetched successfully',
      data: paginatedContacts,
    };
  }

  private async getConnectedContactOrThrow(
    id: string,
    ownerContactId: string,
  ): Promise<Contact> {
    const contact = await this.eventContactRepository.findConnectedContactById(
      id,
      ownerContactId,
    );

    if (!contact) {
      throw new NotFoundException('Event contact not found');
    }

    return contact;
  }

  private async ensurePhoneNumberIsAvailable(
    phoneNumber?: string,
    contactIdToIgnore?: string,
  ): Promise<void> {
    if (!phoneNumber) {
      return;
    }

    const existingPhoneContact =
      await this.eventContactRepository.findByPhoneNumber(phoneNumber);

    if (existingPhoneContact && existingPhoneContact.id !== contactIdToIgnore) {
      throw new ConflictException(
        'A contact with this phone number already exists',
      );
    }
  }

  private async ensureEmailAndUserIdDoNotBelongToDifferentContacts(
    emailContactId?: string,
    userIdContactId?: string,
  ): Promise<void> {
    if (
      !emailContactId ||
      !userIdContactId ||
      emailContactId === userIdContactId
    ) {
      return;
    }

    throw new ConflictException(
      'This email is already linked to another profile',
    );
  }
}
