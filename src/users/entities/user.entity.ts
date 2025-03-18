import { genSalt, hash } from 'bcrypt';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  username: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: true,
    name: 'wallet_address',
  })
  walletAddress?: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 1000.0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @BeforeInsert()
  private async hashPassword() {
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
  }
}
