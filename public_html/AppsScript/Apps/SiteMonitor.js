function init() {
  removeJobs(true);
  var sheet = SpreadsheetApp.getActiveSpreadsheet();

  var urls = sheet.getSheets()[0].getRange("B2").getValue();

  urls = urls.replace(/\s/g, "").split(",");
  var time = (new Date()).getTime();
  var db = ScriptDb.getMyDb();

  for (i = 0; i < urls.length; i++) {
    db.save({url: urls[i], status: 200});
  }

  // Setup trigger that runs every 5 minutes
  ScriptApp.newTrigger("websiteMonitor").timeBased().everyMinutes(5).create();

  sheet.toast("The monitor of your website(s) is ON. You can exit this sheet.", "Initialized", -1);
}

//
//
//
function websiteMonitor() {
  var db = ScriptDb.getMyDb();
  var results = db.query({});

  while (results.hasNext()) {

    var item = results.next();
    var code = -1;
    try {
      var response = UrlFetchApp.fetch(item.url);
      var checkRes = response.getContentText();
      if (checkRes.indexOf("Process is not running") > 1) {
        // Out process is down!
        code = 503; // = Our service is not avilable
      }
      else {
        code = response.getResponseCode();
      }
    } catch (error) {
    }

    item.status = alertUser(item, code);
    db.save(item);
  }
}

//
//
//
function alertUser(item, code) {

  var status = item.status;
  // We are cool
  if (code === 200) {
    return code;
  }

  // Site was up previously but is now down
  if (code === 503 && (status === 200)) {
    // Run another check after 1 minutes to prevent false positives
    quickCheck();
    return code;
  }

  // Site was down previously but up on second check
  if (code === 200 && status === 503) {
    return code;
  }

  // Site was down previously and is down again
  if ((code === -1 || code === 503) && status === 503) {
    quickCheck();
    logMessage(item.url, "Process is Down");
    return code;
  }

  // Site was down previously but up again
  if ((code === 200) && (status === -1)) {
    logMessage(item.url, "Process is Up");
    return code;
  }

  return code;
}

//
//
//
function logMessage(url, message) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = sheet.getLastRow() + 1;
  var time = new Date();

  sheet.getRange(row, 1).setValue(time);
  sheet.getRange(row, 2).setValue(message + " : " + url);

  var alert = "Site " + url + " is " + message.toLowerCase();

  //MailApp.sendEmail(sheet.getRange("B3").getValue(), "Site " + message, alert);  

  if (sheet.getRange("B4").getValue().toLowerCase() == "yes") {
    time = new Date(time.getTime() + 15000);
    CalendarApp.createEvent(alert, time, time).addSmsReminder(0);
  }
  return;
}

//
//
//
function secondCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "secondCheck") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  websiteMonitor();
}

function quickCheck() {
  ScriptApp.newTrigger("secondCheck").timeBased().after(120000).create();
  return;
}

//
//
//
function removeJobs(quiet) {

  // Clean the database
  var db = ScriptDb.getMyDb();

  while (true) {
    var result = db.query({});
    if (result.getSize() == 0) {
      break;
    }
    while (result.hasNext()) {
      db.remove(result.next());
    }
  }

  // Delete all Script Triggers
  var triggers = ScriptApp.getScriptTriggers();
  for (i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Inform the user, default is "YES"
  if (!quiet) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    sheet.toast("The program has stopped. You can choose Start under Website Monitor "
            + "menu anytime later to resume website monitoring!", "Uninstalled", -1);

  }
}
