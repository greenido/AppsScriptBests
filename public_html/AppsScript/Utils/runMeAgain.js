/**
 * When you wish to run a task more then once. 
 * These 2 helper function will help you set another task (or more) to 'finish' the job.
 * @author Ido Green | @greenido
 * 
 */

//
// We will call this function to update 
// (!) Make sure to replace the TODO
//
function updateXX() {
  // Do some work here
  Logger.log("** Going to work hard & long **");
  
  // run me again in 7min = 7*60*1000
  var tmpTrigger = runMeAgainInXmin(420000, "TODO-your-function-name-here");
  Logger.log("our trigger for updateXX: " + tmpTrigger.getUniqueId());
  
  // Save our triggerId so we can remove it after the execution.
  // It's also helpful to have all our meta data in a sheet to debug issues.
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("metaData").getRange(1,1).setValue(tmpTrigger.getUniqueId());
}


//
// Run me in X milliseconds into the future
//
function runMeAgainInXmin(waitForMin, functionToRun) {
  Logger.log("** Going to set a new trigger for: " + functionToRun +
   " to run in: " + waitForMin);
  var oneTimeOnly = ScriptApp.newTrigger(functionToRun).timeBased()
      .after(waitForMin).create();
  return oneTimeOnly;
}