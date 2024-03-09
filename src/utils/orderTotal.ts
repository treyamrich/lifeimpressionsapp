import { TShirtOrder } from "@/API";

export interface OrderTotalModel {
    taxRate: number;
    shipping?: number;
    fees?: number;
    discount: number;
}

export type OrderTotal = {
    subtotal: number;
    flatItemDiscounts: number;
    fullOrderDiscounts: number;
    totalDiscounts: number;
    discountsApplied: number;
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

    const fullOrderDiscounts = order.discount;
    const flatItemDiscounts = orderedItems
        .map(item => item.discount)
        .reduce((prev, curr) => prev + curr, 0);
    const totalDiscounts = fullOrderDiscounts + flatItemDiscounts;

    const discountsApplied = Math.max(0, subtotal - totalDiscounts);

    const taxRate = order.taxRate / 100;
    const fees = order.fees ?? 0;
    const shipping = order.shipping ?? 0;

    const tax = taxRate * discountsApplied;

    const total = discountsApplied + tax + shipping + fees;

    return {
        subtotal,
        flatItemDiscounts,
        fullOrderDiscounts,
        totalDiscounts,
        discountsApplied,
        taxRate,
        fees,
        shipping,
        tax,
        total
    }
}