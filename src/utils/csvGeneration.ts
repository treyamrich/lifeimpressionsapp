export type CSVHeader = {
    headerName: string;
    columnKey: string;
}

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean
    }
}

export const processCSVCell = (value: any): string => {
    if (!value) return '';
    let innerValue = value.toString();
    let result = innerValue.replace(/"/g, '""');
    if (result.search(/("|,|\n)/g) >= 0)
        result = '"' + result + '"';
    return result
}

export const downloadCSV = (filename: string, headers: CSVHeader[], data: any[], titleHeader?: string): Blob => {

    const processRow = (row: any) =>
        headers.map(header => processCSVCell(row[header.columnKey])).join(',') + '\n';

    let csvFile = '';

    if(titleHeader) {
        csvFile += `${titleHeader}\n\n`
    }

    csvFile += headers.map(h => processCSVCell(h.headerName)).join(',') + '\n';
    data.forEach(row => {
        csvFile += processRow(row)
    })

    let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    return blob
}