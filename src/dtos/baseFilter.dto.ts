import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';

export class BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @Trim()
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @Trim()
  @IsString()
  @IsOptional()
  searchQuery?: string;
}
