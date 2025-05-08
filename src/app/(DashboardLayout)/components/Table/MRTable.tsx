import MaterialReactTable, { MaterialReactTableProps } from "material-react-table";

export const MRTable = <TData extends Record<string, any>>(props: MaterialReactTableProps<TData>) =>{
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <MaterialReactTable {...props} />
        </div>
    );
}