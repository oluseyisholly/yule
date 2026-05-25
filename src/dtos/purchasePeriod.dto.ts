import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import { PurchasePeriodItemDto } from './purchasePeriodItem.dto';
import { Type } from 'class-transformer';



export class PurchasePeriodDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty({
    example: '2025-01-10T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  requestEndDate: string;

  @ApiProperty({
    example: '2025-01-15T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  marketRunDate: string;

  @ApiProperty({
    type: [PurchasePeriodItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchasePeriodItemDto)
  marketRunCommodities: PurchasePeriodItemDto[];
}




export class UpdatePurchasePeriodDto extends PartialType(PurchasePeriodDto) {}

export class PurchasePeriodFilterDto extends BaseFilterDto {}
