// src/common/repositories/base.repository.ts
import { RequestContext } from 'src/common/context/requestContext';
import {
  PaginationDto,
  normalizePagination,
} from 'src/dtos/pagination.dto';
import { PaginatedRecordsDto } from 'src/dtos/response.dto';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

export class BaseRepository<T extends { id: any }> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly repo: Repository<T>,
  ) {}
  private getGroupId() {
    return RequestContext.get('groupId');
  }

  async create(data: DeepPartial<T>, hasGroupId = true): Promise<T> {
    const groupId = this.getGroupId();

    const entity = hasGroupId
      ? this.repo.create({ ...data, groupId: groupId })
      : this.repo.create(data);
    return this.repo.save(entity);
  }

  findById(id: any, options?: FindOneOptions<T>) {
    return this.repo.findOne({ where: { id } as any, ...(options ?? {}) });
  }
  findOne(where: FindOptionsWhere<T>, options?: FindOneOptions<T>) {
    return this.repo.findOne({ where, ...(options ?? {}) });
  }
  findAll(options?: FindManyOptions<T>) {
    return this.repo.find(options);
  }
  exists(where: FindOptionsWhere<T>) {
    return this.repo.exist({ where });
  }
  async update(id: any, patch: DeepPartial<T>) {
    await this.repo.update(id, patch);
    const v = await this.findById(id);
    if (!v) throw new Error('EntityNotFound');
    return v;
  }
  async delete(id: any, soft = true) {
    if (soft && (this.repo.softDelete as any))
      await (this.repo.softDelete as any)(id);
    else await this.repo.delete(id);
  }

  async paginate(
    options: FindManyOptions<T> & {
      search?: string;
      searchFields?: (keyof T)[];
      selectFields?: (keyof T)[]; // 👈 new option
      include?: string[];
    } = {},
    PaginationDto: PaginationDto,
  ): Promise<PaginatedRecordsDto<T>> {
    const { page, pageSize } = normalizePagination(PaginationDto);

    const {
      search,
      searchFields = [],
      selectFields = [],
      include = [],

      where: existingWhere,
      ...rest
    } = options;

    // 🔍 build dynamic where for search
    let where = existingWhere;

    if (search && searchFields.length) {
      const searchWhere = searchFields.map((field) => ({
        [field]: ILike(`%${search}%`),
      })) as any[];

      // merge with existing where conditions if any
      if (Array.isArray(existingWhere)) {
        where = [...existingWhere, ...searchWhere];
      } else if (existingWhere) {
        where = [existingWhere, ...searchWhere];
      } else {
        where = searchWhere;
      }
    }

    const [data, total] = await this.repo.findAndCount({
      ...rest,
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: selectFields.length ? (selectFields as any) : undefined, // 👈 key addition
      relations: include.length ? include : undefined, // 👈 this enables joins
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async transaction<R>(fn: (repo: Repository<T>) => Promise<R>) {
    return this.dataSource.transaction(async (em) => {
      const txRepo = em.getRepository<T>(this.repo.metadata.target as any);
      return fn(txRepo);
    });
  }
}
