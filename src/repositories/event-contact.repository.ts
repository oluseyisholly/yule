import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateEventContactDto,
  FindEventContactsQueryDto,
  SyncEventContactDto,
  UpdateEventContactDto,
} from 'src/dtos/event-contact.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { Gender } from 'src/common/index.enum';
import { ContactConnection } from 'src/entities/contact-connection.entity';
import { Contact } from 'src/entities/contact.entity';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';

export type AuthContactPayload = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

@Injectable()
export class EventContactRepository {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(ContactConnection)
    private readonly contactConnectionRepo: Repository<ContactConnection>,
  ) {}

  async createEventContact(
    createEventContactDto: CreateEventContactDto,
    ownerContactId: string,
  ): Promise<Contact> {
    const contact = this.contactRepo.create({
      ...createEventContactDto,
      createdById: ownerContactId,
    });

    const savedContact = await this.contactRepo.save(contact);
    await this.ensureContactConnection(ownerContactId, savedContact.id);

    return savedContact;
  }

  async createContactFromAuthPayload(
    payload: AuthContactPayload,
  ): Promise<Contact> {
    const fallbackName = payload.email?.split('@')[0] ?? 'User';
    const contact = await this.contactRepo.save(
      this.contactRepo.create({
        firstName: payload.firstName ?? fallbackName,
        lastName: payload.lastName ?? '',
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        gender: Gender.MALE,
        userId: payload.userId,
      }),
    );

    contact.createdById = contact.id;

    return this.contactRepo.save(contact);
  }

  async findByUserId(userId: string): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: {
        userId,
      },
    });
  }

  async findById(id: string): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<Contact | null> {
    return this.contactRepo
      .createQueryBuilder('contact')
      .where('LOWER(contact.email) = LOWER(:email)', { email })
      .andWhere('contact.deleted_at IS NULL')
      .getOne();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findOwnedContactById(
    id: string,
    ownerContactId: string,
  ): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: {
        id,
        createdById: ownerContactId,
      },
    });
  }

  async findConnectedContactById(
    id: string,
    ownerContactId: string,
  ): Promise<Contact | null> {
    return this.contactRepo
      .createQueryBuilder('contact')
      .innerJoin(
        ContactConnection,
        'connection',
        'connection.contact_id = contact.id',
      )
      .where('contact.id = :id', { id })
      .andWhere('connection.owner_contact_id = :ownerContactId', {
        ownerContactId,
      })
      .andWhere('contact.deleted_at IS NULL')
      .getOne();
  }

  async findConnectedContactByEmail(
    email: string,
    ownerContactId: string,
  ): Promise<Contact | null> {
    return this.contactRepo
      .createQueryBuilder('contact')
      .innerJoin(
        ContactConnection,
        'connection',
        'connection.contact_id = contact.id',
      )
      .where('LOWER(contact.email) = LOWER(:email)', { email })
      .andWhere('connection.owner_contact_id = :ownerContactId', {
        ownerContactId,
      })
      .andWhere('contact.deleted_at IS NULL')
      .getOne();
  }

  async findByEmailForUser(
    email: string,
    userId: string,
  ): Promise<Contact | null> {
    const ownerContact = await this.findByUserId(userId);

    if (!ownerContact) {
      return null;
    }

    return this.findConnectedContactByEmail(email, ownerContact.id);
  }

  async updateEventContact(
    id: string,
    updateEventContactDto: UpdateEventContactDto | SyncEventContactDto,
    ownerContactId: string,
  ): Promise<Contact> {
    await this.contactRepo.update(id, {
      ...updateEventContactDto,
      updatedById: ownerContactId,
    });

    return this.contactRepo.findOneOrFail({
      where: {
        id,
      },
    });
  }

  async linkContactToUser(id: string, userId: string): Promise<Contact> {
    await this.contactRepo.update(id, { userId });

    return this.contactRepo.findOneOrFail({
      where: {
        id,
      },
    });
  }

  async deleteEventContact(id: string): Promise<void> {
    await this.contactRepo.softDelete(id);
  }

  async ensureContactConnection(
    ownerContactId: string,
    contactId: string,
  ): Promise<ContactConnection | null> {
    if (ownerContactId === contactId) {
      return null;
    }

    const existingConnection = await this.contactConnectionRepo.findOne({
      where: {
        ownerContactId,
        contactId,
      },
    });

    if (existingConnection) {
      return existingConnection;
    }

    return this.contactConnectionRepo.save(
      this.contactConnectionRepo.create({
        ownerContactId,
        contactId,
        createdById: ownerContactId,
      }),
    );
  }

  async findAllEventContacts(
    query: FindEventContactsQueryDto,
    excludeContactId?: string,
  ): Promise<PaginatedRecordsDto<Contact>> {
    const qb = this.contactRepo.createQueryBuilder('contact');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'contact.gender': query.gender,
      })
      .applyDateRange('contact.createdAt', query.startDate, query.endDate)
      .applySorting('contact.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('contact."firstName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact.email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact.phoneNumber ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    if (excludeContactId) {
      qb.andWhere('contact.id != :excludeContactId', { excludeContactId });
    }

    qb.andWhere('contact.deleted_at IS NULL');

    return helper.paginate(query);
  }

  async findMyEventContacts(
    query: FindEventContactsQueryDto,
    ownerContactId: string,
  ): Promise<PaginatedRecordsDto<Contact>> {
    const qb = this.contactRepo
      .createQueryBuilder('contact')
      .innerJoin(
        ContactConnection,
        'connection',
        'connection.contact_id = contact.id',
      );
    const helper = new QueryBuilderHelper(qb);

    helper
      .applyFilter({
        'contact.gender': query.gender,
      })
      .applyDateRange('contact.createdAt', query.startDate, query.endDate)
      .applySorting('contact.createdAt', query.sortOrder);

    if (query.searchQuery) {
      qb.andWhere(
        new Brackets((subQuery) => {
          subQuery.where('contact."firstName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact."lastName" ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact.email ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
          subQuery.orWhere('contact.phoneNumber ILIKE :searchQuery', {
            searchQuery: `%${query.searchQuery}%`,
          });
        }),
      );
    }

    qb.andWhere('connection.owner_contact_id = :ownerContactId', {
      ownerContactId,
    });
    qb.andWhere('contact.deleted_at IS NULL');

    return helper.paginate(query);
  }
}
