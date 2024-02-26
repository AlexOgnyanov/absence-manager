import { AbsenceTypeEntity } from 'src/absences/entities';
import { DepartmentEntity } from 'src/departments/entities';
import { RoleEntity } from 'src/roles/entities';
import { UserEntity } from 'src/user/entities';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column()
  ownerContactEmail: string;

  @OneToMany(() => AbsenceTypeEntity, (absenceType) => absenceType.company, {
    eager: true,
  })
  absenceTypes: AbsenceTypeEntity[];

  @OneToOne(() => UserEntity, (user) => user.ownedCompany, {
    eager: true,
  })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.company, {})
  employees: UserEntity[];

  @OneToMany(() => RoleEntity, (role) => role.company, {
    onDelete: 'CASCADE',
    eager: true,
  })
  roles: RoleEntity[];

  @OneToMany(() => DepartmentEntity, (department) => department.company)
  departments: DepartmentEntity[];
}
