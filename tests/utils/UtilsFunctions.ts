import ExcelJS from 'exceljs';

export async function getExcelCellValue(filePath:string, sheetName:string, rowNumber:number, colNumber:number) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
        throw new Error(`Worksheet "${sheetName}" not found in file "${filePath}".`);
    }
    const row = worksheet.getRow(rowNumber);
    const cell = row.getCell(colNumber);
    return cell.value;
}

module.exports = { getExcelCellValue };