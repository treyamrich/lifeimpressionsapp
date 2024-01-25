export const filterGeneratedFields = (obj: any): string[] => {
    return Object.keys(obj).filter(key => ![
        // Every object generated field
        "id",
        "createdAt",
        "updatedAt",

        // TShirtOrder generated fields
        "purchaseOrderOrderedItemsId",
        "customerOrderOrderedItemsId",

        // Customer/Purchase Order generated fields
        "isDeleted",

        // Order change generated fields
        "purchaseOrderChangeTshirtId",
        "customerOrderChangeTshirtId",
        
    ].includes(key))
}