import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  Column,
} from 'typeorm';
import { UserEntity } from 'src/user/entities';

import { AbsenceStatusesEnum } from '../enums';

import { AbsenceTypeEntity } from './absence-type.entity';

@Entity('absence')
export class AbsenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  count: number;

  @Column({
    type: 'enum',
    enum: AbsenceStatusesEnum,
  })
  status: AbsenceStatusesEnum;

  @Column({
    nullable: true,
  })
  note: string;

  @ManyToOne(() => UserEntity, (user) => user.takenAbsences, {
    eager: true,
    cascade: true,
    onDelete: 'NO ACTION',
  })
  user: UserEntity;

  @ManyToOne(
    () => AbsenceTypeEntity,
    (absenceType) => absenceType.takenAbsences,
    {
      onDelete: 'NO ACTION',
      cascade: true,
    },
  )
  absenceType: AbsenceTypeEntity;

  @ManyToOne(() => UserEntity, (user) => user.replacements, {
    onDelete: 'NO ACTION',
    cascade: true,
  })
  replacementUser: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
