import { TShirtOrder } from "@/API";

export interface OrderTotalModel {
    taxRate: number;
    shipping?: number;
    fees?: number;
}

export type OrderTotal = {
    subtotal: number;
    taxRate: number;
    fees: number;
    shipping: number;
    tax: number;
    total: number;
}

export const calculateOrderTotal = (order: OrderTotalModel, orderedItems: TShirtOrder[]): OrderTotal => {
    const subtotal = orderedItems
        .map(item => item.costPerUnit * item.quantity)
        .reduce((prev, curr) => prev + curr, 0);

    const taxRate = order.taxRate / 100;
    const fees = order.fees ?? 0;
    const shipping = order.shipping ?? 0;

    const tax = taxRate * subtotal;

    const total = subtotal + tax + shipping + fees;

    return {
        subtotal,
        taxRate,
        fees,
        shipping,
        tax,
        total
    }
}