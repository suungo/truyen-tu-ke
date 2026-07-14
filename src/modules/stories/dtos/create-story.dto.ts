import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({ example: 'Cuộc phiêu lưu kỳ diệu' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiPropertyOptional({ example: 'Câu chuyện về một hành trình...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Nhân vật chính: Tí, Tèo...' })
  @IsOptional()
  @IsString()
  characters?: string;

  @ApiPropertyOptional({ example: 'Bối cảnh làng quê yên bình...' })
  @IsOptional()
  @IsString()
  setting?: string;

  @ApiProperty({ example: 'Nội dung truyện đầy đủ ở đây...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  genreId?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isShortStory?: boolean;
}
