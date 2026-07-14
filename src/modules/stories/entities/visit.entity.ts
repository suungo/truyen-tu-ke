import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
