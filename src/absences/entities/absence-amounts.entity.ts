import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entities';

import { AbsenceTypeEntity } from '.';

@Entity('absence_amount')
export class AbsenceAmountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  amount: number;

  @Column()
  absenceTypeId: number;

  @Column()
  userId: string;

  @ManyToOne(
    () => AbsenceTypeEntity,
    (absenceType) => absenceType.absenceTypeAmounts,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  absenceType: AbsenceTypeEntity;

  @ManyToOne(() => UserEntity, (user) => user.absenceTypeAmounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
