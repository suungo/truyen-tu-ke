import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reader_otps')
export class ReaderOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ length: 6 })
  otp: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
