import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';

import { Type } from 'class-transformer';
import { OnlyOneBaseUnitConstraint } from 'src/decorators/commodity/baseUnitDecorator';

export class CommodityUnitItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty({
    required: false,
    description:
      'Factor used to convert this unit TO the base unit (derived units only)',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  conversionFactor?: number;

  @ApiProperty({
    required: false,
    description: 'Base unit ID. If null, this unit is treated as a base unit.',
  })
  @IsBoolean()
  @IsOptional()
  isBaseUnit?: boolean;
}

export class CommodityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  categoryId: string;

  @ApiProperty({
    type: [CommodityUnitItemDto],
    required: false,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommodityUnitItemDto)
  @Validate(OnlyOneBaseUnitConstraint)
  commodityUnits?: CommodityUnitItemDto[];
}

export class UpdateCommodityDto extends PartialType(CommodityDto) {}

export class CommodityFilterDto extends BaseFilterDto {}
