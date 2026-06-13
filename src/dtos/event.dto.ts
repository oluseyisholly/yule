import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { BaseFilterDto } from './baseFilter.dto';
import { Trim } from 'src/decorators/trim.decorator';

export class EventDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Trim()
  @IsDate()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  time: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}


export class EventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsString()
  @IsOptional()
  searchQuery?: string;
}
