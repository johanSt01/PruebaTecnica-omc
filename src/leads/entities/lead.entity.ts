import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FuenteEnum {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LANDING_PAGE = 'landing_page',
  REFERIDO = 'referido',
  OTRO = 'otro',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ type: 'enum', enum: FuenteEnum })
  fuente: FuenteEnum;

  @Column({ nullable: true, name: 'producto_interes', length: 255 })
  productoInteres: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  presupuesto: number;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
