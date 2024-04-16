import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Chat {
    @PrimaryColumn()
    public ChatID: number = 0;

    @Column({type: "text" })
    public Title: string = "";

    @Column({ type: "timestamp" })
    public CreationDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));

    @Column()
    public CreatorID: number = 0;
}