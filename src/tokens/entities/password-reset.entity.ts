import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

@Entity('password_reset_token')
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => UserEntity, (user) => user.passwordResetTokens, {
    cascade: true,
    eager: true,
  })
  user: UserEntity;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
