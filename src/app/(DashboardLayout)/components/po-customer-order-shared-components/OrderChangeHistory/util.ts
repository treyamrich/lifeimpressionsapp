import { CreateOrderChangeInput, FieldChange, TShirtOrder } from "@/API";
import { EntityType } from "../CreateOrderPage";
import { columnInfo, iterateColumnInfo } from "../../TShirtOrderTable/table-constants";

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
    const buildFieldChange = (fieldName: string, oldVal: any, newVal: any) => (
        { fieldName: fieldName, oldValue: oldVal, newValue: newVal } as FieldChange
    );

    iterateColumnInfo((columnKey, colInfo) => {
        if(!colInfo?.isEditable) return;
        let oldVal = input.oldTShirtOrder[columnKey as keyof TShirtOrder];
        let newVal = input.newTShirtOrder[columnKey as keyof TShirtOrder];
        if(oldVal !== newVal) {
            orderChange.fieldChanges.push(
                buildFieldChange(columnKey as string, oldVal, newVal)
            )
        }
    });

    return orderChange;
}