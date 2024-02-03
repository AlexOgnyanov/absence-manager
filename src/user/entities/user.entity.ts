import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/roles/entities';
import { CompanyEntity } from 'src/companies/entities';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    nullable: true,
    unique: true,
  })
  phone: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'SET NULL' })
  role: RoleEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @ManyToOne(() => CompanyEntity, (company) => company.employees, {
    nullable: true,
  })
  company: CompanyEntity;
}
