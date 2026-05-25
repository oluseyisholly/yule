import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BaseFilterDto } from './baseFilter.dto';
import { RequestItemDto } from './requestItem.dto';
import { Type } from 'class-transformer';

export class RequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  purchasePeriodId: string;



  @ApiProperty({
    type: [RequestItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  requestItems: RequestItemDto[];
}

export class UpdateRequestDto extends PartialType(RequestDto) {}

export class RequestFilterDto extends BaseFilterDto {}
