import { ApiProperty, PartialType } from '@nestjs/swagger';
import {  IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { BaseFilterDto } from './baseFilter.dto';
import { Trim } from 'src/decorators/trim.decorator';

export class RequestItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  purchasePeriodId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  purchasePeriodItemId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  requestedQty: number;
}

export class UpdateRequestItemDto extends PartialType(RequestItemDto) {}

export class RequestItemFilterDto extends BaseFilterDto {}
