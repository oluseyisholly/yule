import { ApiProperty } from '@nestjs/swagger';

type DtoClass<T = any> = new (...args: any[]) => T;

export class IdResponseDto {
  @ApiProperty()
  id: string;
}

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
