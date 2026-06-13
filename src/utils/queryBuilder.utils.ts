// src/common/utils/query-builder.util.ts
import { Brackets, SelectQueryBuilder } from 'typeorm';
import {
  PaginatedRecordsDto,
  PaginationDto,
  normalizePagination,
} from 'src/dtos/general.dto';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { RequestContext } from 'src/common/context/requestContext';

interface Relation {
  alias: string;
  path: string;
}

export class QueryBuilderHelper<T> {
  constructor(private readonly qb: SelectQueryBuilder<T>) {}

  applyRelations(relations: Relation[]) {
    relations.forEach((r) => this.qb.leftJoinAndSelect(r.path, r.alias));
    return this;
  }

  /** Explicitly choose which columns to fetch */
  applySelect(selects: string[]) {
    if (selects?.length) this.qb.select(selects);
    return this;
  }

  /** Optionally append rather than replace */
  addSelect(selects: string[]) {
    if (selects?.length) selects.forEach((s) => this.qb.addSelect(s));
    return this;
  }

  applySearch(search: string | Record<string, string>) {
    if (!search) return this;

    if (typeof search === 'string') {
      // keep the old string-based format
      const terms = search.split(',').map((s) => s.trim());
      terms.forEach((term, index) => {
        const [field, value] = term.split(':');
        if (field && value) {
          const param = `search_${index}`;
          const condition = `${field} ILIKE :${param}`;
          if (index === 0) {
            this.qb.where(condition, { [param]: `%${value}%` });
          } else {
            this.qb.orWhere(condition, { [param]: `%${value}%` });
          }
        }
      });
    } else {
      // handle object format
      const entries = Object.entries(search).filter(([_, value]) => !!value);

      entries.forEach(([field, value], index) => {
        const param = `search_${index}`;
        const condition = `${field} ILIKE :${param}`;
        if (index === 0) {
          this.qb.where(condition, { [param]: `%${value}%` });
        } else {
          this.qb.orWhere(condition, { [param]: `%${value}%` });
        }
      });
    }

    return this;
  }

  applySorting(sortBy: string, sortOrder: 'ASC' | 'DESC') {
    if (sortBy) this.qb.orderBy(sortBy, sortOrder);
    return this;
  }

  applyFilter(filters: Record<string, any>) {
    if (!filters || Object.keys(filters).length === 0) return this;

    Object.entries(filters).forEach(([field, value], index) => {
      if (value === undefined || value === null || value === '') return;

      const paramKey = `filter_${field.replace(/[^a-zA-Z0-9_]/g, '_')}_${index}`;
      const operator = Array.isArray(value)
        ? 'IN'
        : typeof value === 'string' && value.includes('%')
          ? 'ILIKE'
          : '=';

      if (operator === 'IN') {
        this.qb.andWhere(`${field} IN (:...${paramKey})`, {
          [paramKey]: value,
        });
      } else if (operator === 'ILIKE') {
        this.qb.andWhere(`${field} ILIKE :${paramKey}`, {
          [paramKey]: value,
        });
      } else {
        this.qb.andWhere(`${field} = :${paramKey}`, {
          [paramKey]: value,
        });
      }
    });

    return this;
  }

  applyDateRange(
    column: string,
    startDate?: string | Date,
    endDate?: string | Date,
  ) {
    if (!startDate && !endDate) return this;

    let parsedStart: Date | undefined;
    let parsedEnd: Date | undefined;

    if (startDate) {
      const date =
        typeof startDate === 'string' ? parseISO(startDate) : startDate;
      parsedStart = isValid(date) ? startOfDay(date) : undefined;
    }

    if (endDate) {
      const date = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      parsedEnd = isValid(date) ? endOfDay(date) : undefined;
    }

    if (parsedStart && parsedEnd) {
      this.qb.andWhere(`${column} BETWEEN :startDate AND :endDate`, {
        startDate: parsedStart,
        endDate: parsedEnd,
      });
    } else if (parsedStart) {
      this.qb.andWhere(`${column} >= :startDate`, { startDate: parsedStart });
    } else if (parsedEnd) {
      this.qb.andWhere(`${column} <= :endDate`, { endDate: parsedEnd });
    }

    return this;
  }

  async findOne(): Promise<T | null> {
    const qb = this.qb;

    return qb.getOne();
  }

  async paginate(options: PaginationDto): Promise<PaginatedRecordsDto<T>> {
    const { page, pageSize } = normalizePagination(options);
    const skip = (page - 1) * pageSize;

    const [data, total] = await this.qb
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
