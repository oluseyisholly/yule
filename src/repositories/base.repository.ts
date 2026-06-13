import { RequestContext } from 'src/common/context/requestContext';
import {
  PaginatedRecordsDto,
  PaginationDto,
  normalizePagination,
} from 'src/dtos/general.dto';
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

  async create(data: DeepPartial<T>): Promise<T> {
    const actorId = RequestContext.getActorId();

    const entity = this.repo.create({ ...data, createdById: actorId });
    return this.repo.save(entity);
  }

  findById(id: any, options?: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne({ where: { id } as any, ...(options ?? {}) });
  }

  findOne(
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    return this.repo.findOne({ where, ...(options ?? {}) });
  }

  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return this.repo.exist({ where });
  }

  async update(id: any, patch: DeepPartial<T>): Promise<T> {
    await this.repo.update(id, patch as any);
    const v = await this.findById(id);
    if (!v) throw new Error('EntityNotFound');
    return v;
  }

  async delete(id: any, soft = true): Promise<void> {
    if (soft && typeof this.repo.softDelete === 'function') {
      await this.repo.softDelete(id);
    } else {
      await this.repo.delete(id);
    }
  }

  async paginate(
    options: FindManyOptions<T> & {
      search?: string;
      searchFields?: (keyof T)[];
      selectFields?: (keyof T)[];
      include?: string[];
    } = {},
    paginationDto: PaginationDto,
  ): Promise<PaginatedRecordsDto<T>> {
    const { page, pageSize } = normalizePagination(paginationDto);
    const {
      search,
      searchFields = [],
      selectFields = [],
      include = [],
      where: existingWhere,
      ...rest
    } = options;

    let where = existingWhere;
    if (search && searchFields.length) {
      const searchWhere = searchFields.map((field) => ({
        [field]: ILike(`%${search}%`),
      })) as any[];

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
      select: selectFields.length ? (selectFields as any) : undefined,
      relations: include.length ? include : undefined,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async transaction<R>(fn: (repo: Repository<T>) => Promise<R>): Promise<R> {
    return this.dataSource.transaction(async (em) => {
      const txRepo = em.getRepository<T>(this.repo.metadata.target as any);
      return fn(txRepo);
    });
  }
}
