import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

@Entity('email_confirmation_token')
export class EmailConfirmationTokenEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => UserEntity, (user) => user.emailConfirmationTokens, {
    cascade: true,
    eager: true,
  })
  user: UserEntity;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
