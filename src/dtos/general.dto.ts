import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

type DtoClass<T = any> = new (...args: any[]) => T;

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  per_page?: number = 25;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional()
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class UpdatePaginationDto extends PartialType(PaginationDto) {}

export class UpdatePagainationDto extends UpdatePaginationDto {}

export type PageInfo = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class PaginatedRecordsDto<T> {
  @ApiProperty({ isArray: true })
  data: Array<T>;

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}

export class DeleteResponseDto {
  @ApiProperty()
  id: string;
}

export function normalizePagination(paginationDto: PaginationDto) {
  const page = Math.max(1, Number(paginationDto.page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(paginationDto.per_page) || 25),
  );

  return { page, pageSize };
}

export function createResponseDto<T>(
  DataDto: DtoClass<T>,
  options?: {
    codeExample?: number;
    messageExample?: string;
  },
) {
  class ResponseDto {
    @ApiProperty({ example: options?.codeExample ?? 200 })
    code: number;

    @ApiProperty({ example: options?.messageExample ?? 'Request successful' })
    message: string;

    @ApiProperty({ type: DataDto })
    data: T;
  }

  return ResponseDto;
}

export function createPaginatedDto<T>(ItemDto: DtoClass<T>) {
  class PaginatedDto extends PaginatedRecordsDto<T> {
    @ApiProperty({ type: [ItemDto] })
    data: T[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
  }

  return PaginatedDto;
}
