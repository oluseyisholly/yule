import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { BaseFilterDto } from './baseFilter.dto';

export class EventDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}


export class EventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchQuery?: string;
}