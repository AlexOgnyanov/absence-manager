import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { CompanyEntity } from 'src/companies/entities';

@Entity('department')
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => CompanyEntity, (company) => company.departments, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  company: CompanyEntity;

  @ManyToMany(() => UserEntity, (user) => user.departments, {
    cascade: true,
    onDelete: 'NO ACTION',
    eager: true,
  })
  @JoinTable()
  users: UserEntity[];
}
