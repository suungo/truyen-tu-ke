import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  chapterNumber: number;

  @ApiProperty({ example: 'Đêm đầu tiên và chiếc bật lửa hết ga' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Nội dung tập truyện đầy đủ...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn gọn nội dung tập...' })
  @IsOptional()
  @IsString()
  synopsis?: string;
}

export class UpdateChapterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  synopsis?: string;
}
