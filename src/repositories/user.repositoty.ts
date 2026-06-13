// src/modules/users/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { QueryBuilderHelper } from 'src/utils/queryBuilder.utils';
import { FindUsersQueryDto } from 'src/dtos/user.dto';
import { PaginatedRecordsDto } from 'src/dtos/general.dto';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(User) repo: Repository<User>,
  ) {
    super(dataSource, repo);
  }

  async findUserByEmail(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async createUser(payload: DeepPartial<User>): Promise<User> {
    return this.repo.save(this.repo.create(payload));
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
      .applyDateRange('user.createdAt', query.startDate, query.endDate)
      .applySorting('user.createdAt', query.sortOrder);

    return helper.paginate(query);
  }
}
