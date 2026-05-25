import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import { Expose} from 'class-transformer';

export class CategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  description: string;
}

export class UpdateCategoryDto extends PartialType(CategoryDto) {}

export class CategoryFilterDto extends BaseFilterDto {}
