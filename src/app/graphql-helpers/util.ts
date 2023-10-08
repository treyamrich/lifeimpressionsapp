export const cleanObjectFields = (obj: any) => {
    return {
        ...obj,
        updatedAt: undefined,
        createdAt: undefined,
        __typename: undefined,
    };
};
  