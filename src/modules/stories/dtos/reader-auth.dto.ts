import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;
}

export class RegisterReaderDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class LoginReaderDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;
}

export class UpdateReaderDto {
  @ApiProperty({ example: 'Nguyễn Văn B' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'reader2@example.com' })
  @IsEmail()
  email: string;
}

export class SendNotificationDto {
  @ApiProperty({ example: 1, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  readerId?: number | null;

  @ApiProperty({ example: 'Thông báo mới' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Nội dung thông báo...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
