import { CreateOrderChangeInput, FieldChange, TShirt, TShirtOrder } from "@/API";
import { EntityType } from "../CreateOrderPage";
import { iterateColumnInfo } from "../../TShirtOrderTable/table-constants";
import { editableTShirtFields } from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";

const buildFieldChange = (fieldName: string, oldVal: any, newVal: any) => (
    { fieldName: fieldName, oldValue: oldVal, newValue: newVal } as FieldChange
);

export type BuildOrderChangeInput = {
    oldTShirtOrder: TShirtOrder;
    newTShirtOrder: TShirtOrder;
    reason: string;
    entityType: EntityType;
    parentOrderId?: string;
}
export const buildOrderChangeInput = (input: BuildOrderChangeInput): CreateOrderChangeInput => {
    const orderChange: CreateOrderChangeInput = {
        reason: input.reason,
        fieldChanges: [],
        orderChangeTshirtId:  input.oldTShirtOrder.id,
        [`${input.entityType === EntityType.PurchaseOrder ? "purchase" : "customer"}OrderChangeHistoryId`]: input.parentOrderId
    };

    iterateColumnInfo((columnKey, colInfo) => {
        if(!colInfo?.isEditable) return;
        let oldVal = input.oldTShirtOrder[columnKey as keyof TShirtOrder];
        let newVal = input.newTShirtOrder[columnKey as keyof TShirtOrder];
        if(oldVal !== newVal) {
            orderChange.fieldChanges.push(
                buildFieldChange(columnKey, oldVal, newVal)
            )
        }
    });
    return orderChange;
}

export type BuildInventoryChangeInput = {
    oldTShirt: TShirt;
    newTShirt: TShirt;
    reason: string;
}
export const buildInventoryChangeInput = (input: BuildInventoryChangeInput): CreateOrderChangeInput => {
    const orderChange: CreateOrderChangeInput = {
        reason: input.reason,
        fieldChanges: [],
        orderChangeTshirtId:  input.oldTShirt.id,
    };

    editableTShirtFields.forEach((columnKey) => {
        let oldVal = input.oldTShirt[columnKey as keyof TShirt];
        let newVal = input.newTShirt[columnKey as keyof TShirt];
        if(oldVal !== newVal) {
            orderChange.fieldChanges.push(
                buildFieldChange(columnKey, oldVal, newVal)
            )
        }
    });

    return orderChange;
}