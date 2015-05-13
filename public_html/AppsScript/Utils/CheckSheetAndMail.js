/**
* Alert when there are new memebers that sign to the group
*
* @author: Ido Green | @greenido
* Update: 13/5/2015
*
*/

//
// Check if new member signed on our registration form and email this info on a daily basis.
//
function checkForNewMembers() {
 var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
 var lastRow = getFirstEmptyRow(ss);
    
 var sMsgs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("msgs");
 var lastTotal = sMsgs.getRange("B25").getValue();
  
  if (lastRow > lastTotal) {
    sMsgs.getRange("B25").setValue(lastRow);
    MailApp.sendEmail("TODO-fill-your-email", "New Members sign up",
      "Yo! We got " + (lastRow - lastTotal) + " new members. Please add them.");
  }
  else {
    Logger.log("It's all good. We still standing on " + lastRow + " members");
  }
}

//
// Get the last empty row (quickly)
//
function getFirstEmptyRow(spr) {
  var column = spr.getRange('A:A');
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct][0] != "" ) {
    ct++;
  }
  return (ct);
}
