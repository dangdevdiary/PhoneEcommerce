import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TypeCoupon {
    "ship", // coupon about shipping, 100 - free ship, 50 - 50% off ship cost
    "percent", // percent of total order, 20 - reduce order total by 20% 
    "amount", // fix amount discount off by total order amount, 10000 - reduce order total by 10000 vnd
}

@Entity("coupons")
export class Coupon {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    code!: string;

    @Column({
        type: "enum",
        enum: TypeCoupon
    })
    type!: TypeCoupon

    @Column()
    value!: number;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column({
        default: true
    })
    active!: boolean;

    @Column()
    number!: number;
}