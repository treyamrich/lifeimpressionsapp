export type CSVHeader = {
    headerName: string;
    columnKey: string;
}

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean
    }
}

export const downloadCSV = (filename: string, headers: CSVHeader[], data: any[]): Blob => {

    const processRow = (row: any) =>
        headers.map(header => processRowValue(row[header.columnKey])).join(',') + '\n';

    const processRowValue = (value: any): string => {
        let innerValue = value.toString();
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
            result = '"' + result + '"';
        return result
    }

    let csvFile = '';
    csvFile += headers.map(h => processRowValue(h.headerName)).join(',') + '\n';
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