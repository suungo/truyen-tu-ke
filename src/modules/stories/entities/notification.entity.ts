import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Reader } from './reader.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reader_id', type: 'integer', nullable: true })
  readerId: number | null;

  @ManyToOne(() => Reader, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader | null;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
