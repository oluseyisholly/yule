import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { FindEventTypesQueryDto } from 'src/dtos/event-type.dto';
import { EventType } from 'src/entities/event-type.entity';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';

@Injectable()
export class EventTypeRepository extends BaseRepository<EventType> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(EventType) repo: Repository<EventType>,
  ) {
    super(dataSource, repo);
  }

  async findByName(
    name: string,
    userId?: string,
    excludeId?: string,
  ): Promise<EventType | null> {
    const qb = this.repo.createQueryBuilder('eventType');

    qb.where('LOWER(eventType.name) = LOWER(:name)', { name });

    if (userId) {
      qb.andWhere('eventType.created_by_id = :userId', { userId });
    }

    if (excludeId) {
      qb.andWhere('eventType.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  async findByIdForUser(id: string, userId: string): Promise<EventType | null> {
    return this.repo
      .createQueryBuilder('eventType')
      .where('eventType.id = :id', { id })
      .andWhere('eventType.created_by_id = :userId', { userId })
      .getOne();
  }

  async findAllEventTypes(
    query: FindEventTypesQueryDto,
  ): Promise<PaginatedRecordsDto<EventType>> {
    const qb = this.repo.createQueryBuilder('eventType');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applySearch({
        'eventType.name': query.searchQuery,
        'eventType.description': query.searchQuery,
      })
      .applyFilter({
        'eventType.isActive': query.isActive,
      })
      .applyDateRange('eventType.createdAt', query.startDate, query.endDate)
      .applySorting('eventType.createdAt', query.sortOrder);

    return helper.paginate(query);
  }

  async findAvailableEventTypes(
    query: FindEventTypesQueryDto,
    userId: string,
  ): Promise<PaginatedRecordsDto<EventType>> {
    const qb = this.repo.createQueryBuilder('eventType');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applySearch({
        'eventType.name': query.searchQuery,
        'eventType.description': query.searchQuery,
      })
      .applyFilter({
        'eventType.isActive': query.isActive,
      })
      .applyDateRange('eventType.createdAt', query.startDate, query.endDate)
      .applySorting('eventType.createdAt', query.sortOrder);

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('eventType.created_by_id IS NULL');
        subQuery.orWhere('eventType.created_by_id = :userId', { userId });
      }),
    );

    return helper.paginate(query);
  }
}
