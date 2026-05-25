import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';

export class CommodityUnitDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsNumber()
  // @Min(1)
  // minQty: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsNumber()
  // @MaxGreaterThanMin('minQty', {
  //   message: 'maxQty must be greater than or equal to minQty',
  // })
  // maxQty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  commodityId: string;

  @ApiProperty({
    required: false,
    description:
      'Factor used to convert this unit TO the base unit (derived units only)',
    example: 12, // e.g. 1 carton = 12 pieces
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  conversionFactor?: number;

  @ApiProperty({
    required: false,
    description: 'Base unit ID. If null, this unit is treated as a base unit.',
  })
  @IsString()
  @IsOptional()
  baseUnitId?: string;
}

export class UpdateCommodityUnitDto extends PartialType(CommodityUnitDto) {}

export class CommodityUnitFilterDto extends BaseFilterDto {}
