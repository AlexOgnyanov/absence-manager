import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { PermissionEntity } from 'src/permissions/entities';
import { CompanyEntity } from 'src/companies/entities';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable()
  permissions?: PermissionEntity[];

  @OneToMany(() => UserEntity, (user) => user.role)
  users?: UserEntity[];

  @ManyToOne(() => CompanyEntity, (company) => company.roles, {
    nullable: true,
  })
  company: CompanyEntity;
}
