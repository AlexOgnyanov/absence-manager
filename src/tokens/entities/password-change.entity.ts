import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

@Entity('password_change_token')
export class PasswordChangeTokenEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => UserEntity, (user) => user.passwordChangeTokens, {
    cascade: true,
    eager: true,
  })
  user: UserEntity;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
