var start = new Date().getTime();
Logger.log("Going to fetch something");
//
// do some work
//
var end = new Date().getTime();
var execTime = (end - start) / 1000;

// Our amazing HTML5 dialog :)
var htmlApp = HtmlService
  .createHtmlOutput('<p>It took us: ' + execTime +
   'sec to run like crazy on the beach</p>')
  .setTitle('Tracker')
  .setWidth(250)
  .setHeight(300);

 SpreadsheetApp.getActiveSpreadsheet().show(htmlApp);

