import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class Meta {
  @PrimaryGeneratedColumn()
  public id: number = 0;

  @Column()
  public descriptor: string = "";

  @Column()
  public hash: string = "";

  @Column()
  public size: number = -1;

  @Column()
  public owner: number = -1;

  @Column()
  public type?: string;
}