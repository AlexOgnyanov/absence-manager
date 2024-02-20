import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/roles/entities';
import { CompanyEntity } from 'src/companies/entities';
import {
  EmailConfirmationTokenEntity,
  PasswordResetTokenEntity,
  PasswordChangeTokenEntity,
} from 'src/tokens/entities';
import { DepartmentEntity } from 'src/departments/entities';
import { SessionEntity } from 'src/auth/entities';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Exclude()
  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
    unique: true,
  })
  phone: string;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @OneToMany(() => EmailConfirmationTokenEntity, (token) => token.user, {
    nullable: true,
  })
  emailConfirmationTokens: EmailConfirmationTokenEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (token) => token.user, {
    nullable: true,
  })
  passwordResetTokens: PasswordResetTokenEntity[];

  @OneToMany(() => PasswordChangeTokenEntity, (token) => token.user, {
    nullable: true,
  })
  passwordChangeTokens: PasswordChangeTokenEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    nullable: true,
    cascade: true,
  })
  sessions: SessionEntity[];

  @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'SET NULL' })
  role: RoleEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.employees, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  company: CompanyEntity;

  @OneToOne(() => CompanyEntity, (company) => company.owner, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  ownedCompany: CompanyEntity;

  @ManyToMany(() => DepartmentEntity, (department) => department.users, {
    onDelete: 'NO ACTION',
  })
  departments: DepartmentEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
