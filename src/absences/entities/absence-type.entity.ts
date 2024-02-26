import { CompanyEntity } from 'src/companies/entities';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';

import { AbsenceAmountEntity } from './absence-amounts.entity';

@Entity('absence_type')
export class AbsenceTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  yealyCount: number;

  @ManyToOne(() => CompanyEntity, (company) => company.absenceTypes, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  company: CompanyEntity;

  @OneToMany(() => AbsenceAmountEntity, (amount) => amount.absenceType, {
    cascade: true,
  })
  absenceTypeAmounts: AbsenceAmountEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
