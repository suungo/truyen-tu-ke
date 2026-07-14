import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateFrameworkEpisodeDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  episodeNumber: number;

  @ApiProperty({ example: 'Tỉnh dậy ở hồng hoang' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Nam ngất do quá sức, tỉnh dậy trong hang đá...',
  })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({
    example: 'Gặp bộ tộc, học đốt lửa, thoát khỏi thú dữ',
  })
  @IsOptional()
  @IsString()
  keyEvents?: string;

  @ApiPropertyOptional({ example: 'Nam, Tộc trưởng, Phù thủy bộ tộc' })
  @IsOptional()
  @IsString()
  charactersInvolved?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateFrameworkPhaseDto {
  @ApiProperty({ example: 'Giai đoạn 1: Sinh Tồn & Bộ Tộc Nguyên Thủy' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Nam sinh tồn trong môi trường hoang sơ...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  episodeFrom: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  episodeTo: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: [CreateFrameworkEpisodeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFrameworkEpisodeDto)
  episodes?: CreateFrameworkEpisodeDto[];
}

export class CreateStoryFrameworkDto {
  @ApiProperty({ example: 20 })
  @IsNumber()
  totalEpisodes: number;

  @ApiPropertyOptional({ example: 'Tổng quan về hành trình của nhân vật...' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ type: [CreateFrameworkPhaseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFrameworkPhaseDto)
  phases?: CreateFrameworkPhaseDto[];
}
