import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

/**
 * Enum for sort order
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * DTO for pagination
 */
export class PaginationDto {
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  per_page?: number = 25;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  // @IsString()
  // @IsOptional()
  // sortBy?: string = 'created_at';

  @ApiPropertyOptional()
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class UpdatePaginationDto extends PartialType(PaginationDto) {}

export class UpdatePagainationDto extends UpdatePaginationDto {}

/**
 * The PageInfo type is used to represent pagination data
 */
export type PageInfo = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function normalizePagination(paginationDto: PaginationDto) {
  const page = Math.max(1, Number(paginationDto.page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(paginationDto.per_page) || 25),
  );

  return { page, pageSize };
}
