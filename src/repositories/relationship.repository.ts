import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { BaseRepository } from './base.repository';
import { FindRelationshipsQueryDto } from 'src/dtos/relationship.dto';
import { Relationship } from 'src/entities/relationship.entity';

@Injectable()
export class RelationshipRepository extends BaseRepository<Relationship> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Relationship) repo: Repository<Relationship>,
  ) {
    super(dataSource, repo);
  }

  async findByName(
    name: string,
    userId?: string,
    excludeId?: string,
  ): Promise<Relationship | null> {
    const qb = this.repo.createQueryBuilder('relationship');

    qb.where('LOWER(relationship.name) = LOWER(:name)', { name });

    if (userId) {
      qb.andWhere('relationship.created_by_id = :userId', { userId });
    }

    if (excludeId) {
      qb.andWhere('relationship.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Relationship | null> {
    return this.repo
      .createQueryBuilder('relationship')
      .where('relationship.id = :id', { id })
      .andWhere('relationship.created_by_id = :userId', { userId })
      .getOne();
  }

  async findAllRelationships(
    query: FindRelationshipsQueryDto,
  ): Promise<PaginatedRecordsDto<Relationship>> {
    const qb = this.repo.createQueryBuilder('relationship');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applySearch({
        'relationship.name': query.searchQuery,
        'relationship.description': query.searchQuery,
      })
      .applyFilter({
        'relationship.is_active': query.isActive,
      })
      .applyDateRange('relationship.created_at', query.startDate, query.endDate)
      .applySorting('relationship.created_at', query.sortOrder);

    return helper.paginate(query);
  }

  async findAvailableRelationships(
    query: FindRelationshipsQueryDto,
    userId: string,
  ): Promise<PaginatedRecordsDto<Relationship>> {
    const qb = this.repo.createQueryBuilder('relationship');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applySearch({
        'relationship.name': query.searchQuery,
        'relationship.description': query.searchQuery,
      })
      .applyFilter({
        'relationship.isActive': query.isActive,
      })
      .applyDateRange('relationship.createdAt', query.startDate, query.endDate)
      .applySorting('relationship.createdAt', query.sortOrder);

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery.where('relationship.created_by_id IS NULL');
        subQuery.orWhere('relationship.created_by_id = :userId', { userId });
      }),
    );

    return helper.paginate(query);
  }
}
