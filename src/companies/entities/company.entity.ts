import { RoleEntity } from 'src/roles/entities';
import { UserEntity } from 'src/user/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  yearlyAbsenceCount: number;

  @OneToMany(() => UserEntity, (user) => user.company, {
    eager: true,
  })
  employees: UserEntity[];

  @OneToMany(() => RoleEntity, (role) => role.company, {
    onDelete: 'CASCADE',
    eager: true,
  })
  roles: RoleEntity[];
}
