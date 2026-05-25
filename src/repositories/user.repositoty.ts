// src/modules/users/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { FindUsersQueryDto } from 'src/dtos/user.dto';
import { PaginatedRecordsDto } from 'src/dtos/response.dto';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User) repo: Repository<User>,
  ) {
    super(dataSource, repo);
  }

  async findUserByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findAllUsers(
    query: FindUsersQueryDto,
  ): Promise<PaginatedRecordsDto<User>> {
    const qb = this.repo.createQueryBuilder('user');
    const helper = new QueryBuilderHelper(qb);

    helper
      .applySearch({
        'user.firstName': query.searchQuery,
        'user.lastName': query.searchQuery,
        'user.email': query.searchQuery,
        'user.phoneNumber': query.searchQuery,
      })
      .applyDateRange('user.created_at', query.startDate, query.endDate)
      .applySorting('user.created_at', query.sortOrder);

    return helper.paginate(query, 'user');
  }
}
