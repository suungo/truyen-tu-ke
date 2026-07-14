import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reader } from '../stories/entities/reader.entity';
import { ReaderOtp } from '../stories/entities/reader-otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reader, ReaderOtp])],
  exports: [TypeOrmModule],
})
export class ReaderModule {}
