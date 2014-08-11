//
// Clean the values from a sheet
//
function cleanSheet(sheetName, fRow, fCol, tRow, tCol) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var aSheet = ss.getSheetByName(sheetName);
  aSheet.getRange(fRow, fCol, tRow, tCol).clear({contentsOnly: true});  
  Logger.log("Done cleaning " + sheetName + " on range: (" + 
      fRow + ", " + fCol + ", " + tRow + ", " + tCol + ")");
}