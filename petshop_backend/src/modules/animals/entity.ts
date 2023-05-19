import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';


@Entity()
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  _id: string

  @Column()
  name: string

  @Column()
  type: string;
  
  @Column()
  breed: string;

  @Column()
  birthDate: string;

  @Column()
  imgUrl: string;

  @Column()
  description: string;

  @Column({ type: 'boolean', default: false })
  pedigree: boolean;
 
  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  transactionHash: string;
}

export class Owner extends Animal {
  constructor(public animal: Animal){
    super();
      }

  @PrimaryGeneratedColumn('uuid')
  ownerId: string;
  @Column()
  ownerName:string;
  @Column()
  ownerLastname: string;



}
