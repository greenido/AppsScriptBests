/**
 * Google Apps Script that supports an event registration site with embeded form.
 * for more details: https://github.com/greenido/events-site-template
 */

// These variables are used throughout the script
//
// This is the string you use to indicate a "yes" RSVP
var YES = "Yes";  

// This is the string you use to indicate a "no" RSVP
var NO = "No";  

// This string indicates someones on the waitlist
var WAITLIST = "Waitlist";  

// The number of questions on the form.
var NUM_FORM_QUESTIONS = 12;  

// This function is called by a trigger when the form is submitted.
// It sends a confirmation email to the person who just submitted the form, 
// using the template in cell A1 of the Email Templates sheet.
function sendInitialConfirmationEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Registration");
  var dataRange = dataSheet.getRange(2, 2, dataSheet.getMaxRows() - 1, NUM_FORM_QUESTIONS + 1);
  var startRow = 2;  // First row of data to process
  var templateSheet = ss.getSheetByName("Email Templates");
  var emailTemplate = "";
  
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange);
  
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    if (rowData.status != YES &&
        rowData.status != NO &&
        rowData.status != WAITLIST) {  // Prevents sending duplicate confirmations
          
      var numYes = 0;
          
      // Go through each existing row and count the number of "YES" responses   
      for (var j = 0; j < objects.length; ++j) {
        var registrations = objects[j];
        if (registrations.status == YES) {
          ++numYes;
        }
      }
      
      //
      // GI: Important - this is the new location of our MAX number of users!
      var max = dataSheet.getRange("O2").getValue();
      if ((numYes < max)) {
        //set the right template (registration confirmed)
        emailTemplate = templateSheet.getRange("A1").getValue();       
        dataSheet.getRange(startRow + i, NUM_FORM_QUESTIONS + 2).setValue(YES);
        // Make sure the cell is updated right away in case the script is interrupted
        SpreadsheetApp.flush();
      } else {
        dataSheet.getRange(startRow + i, NUM_FORM_QUESTIONS + 2).setValue(WAITLIST);
        //set the right template (waitlist)
        emailTemplate = templateSheet.getRange("A2").getValue();  
        
        // Make sure the cell is updated right away in case the script is interrupted
        SpreadsheetApp.flush();  
      }
      // Generate a personalized email.
      // Given a template string, replace markers (for instance ${"First Name"}) with
      // the corresponding value in a row object (for instance rowData.firstName).
      var emailText = fillInTemplateFromObject(emailTemplate, rowData);
      var emailSubject = dataSheet.getRange("P2").getValue() + " Registration";
          
      MailApp.sendEmail(rowData.emailAddress, emailSubject, emailText);
      objects = getRowsData(dataSheet, dataRange);    
    }
  } 
}

//this is what gets called when we want to update the waitlist.
function updateWaitlist() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Registration");
  var dataRange = dataSheet.getRange(2, 2, dataSheet.getMaxRows() - 1, NUM_FORM_QUESTIONS + 1);
  var startRow = 2;  // First row of data to process
  var templateSheet = ss.getSheetByName("Email Templates");
  var emailTemplate = templateSheet.getRange("A3").getValue();
  
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange);
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    if (rowData.status == WAITLIST) {  //Only contact people who are waitlisted
          
      var numYes = 0;
      //go through each existing row and count the number of "YES"    
      for (var j = 0; j < objects.length; ++j) {
        var registrations = objects[j];
        Logger.log(registrations.status);
        if (registrations.status == YES) {
          ++numYes;
        }
      }
      var max = dataSheet.getRange("O2").getValue();
      if ((numYes < max)) {
        //set the right template (registration confirmed)
        dataSheet.getRange(startRow + i, NUM_FORM_QUESTIONS + 2).setValue(YES);
        // Generate a personalized email.
        // Given a template string, replace markers (for instance ${"First Name"}) with
        // the corresponding value in a row object (for instance rowData.firstName).
        var emailText = fillInTemplateFromObject(emailTemplate, rowData);
        var emailSubject = dataSheet.getRange("K2").getValue() + " Registration";
          
    // GI: If you wish to send the email by using alias email add this:
    //  MailApp.sendEmail(rowData.emailAddress, emailSubject, emailText, {name: "Ido", replyTo: "example@gmail.com"});
        MailApp.sendEmail(rowData.emailAddress, emailSubject, emailText);
        objects = getRowsData(dataSheet, dataRange);  
        
        // Make sure the cell is updated right away in case the script is interrupted
        SpreadsheetApp.flush();
      }
  
    }
  } 
}

//
//Call this when you want to send the call for Feedback email AFTER the event is done
//
function sendFeedbackEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Registration");
  var dataRange = dataSheet.getRange(2, 2, dataSheet.getMaxRows() - 1, NUM_FORM_QUESTIONS + 1);
  var startRow  = 2;  // First row of data to process
  var templateSheet = ss.getSheetByName("Email Templates");
  var emailTemplate = templateSheet.getRange("A5").getValue();
  
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange);
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    if (rowData.status == YES) {  //Only contact people who are 'yes' status
      // Generate a personalized email.
      // Given a template string, replace markers (for instance ${"First Name"}) with
      // the corresponding value in a row object (for instance rowData.firstName).
      var emailText = fillInTemplateFromObject(emailTemplate, rowData);
      var emailSubject = dataSheet.getRange("P2").getValue() + " Reminder";
      
      MailApp.sendEmail(rowData.emailAddress, emailSubject, emailText);
      
      // Make sure the cell is updated right away in case the script is interrupted
      SpreadsheetApp.flush();
    }
  } 
}



//Call this when you want to send the reminder email to confirmed attendees 
//about a week before the event
function sendReminderEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Registration");
  var dataRange = dataSheet.getRange(2, 2, dataSheet.getMaxRows() - 1, NUM_FORM_QUESTIONS + 1);
  var startRow = 2;  // First row of data to process
  var templateSheet = ss.getSheetByName("Email Templates");
  var emailTemplate = templateSheet.getRange("A4").getValue();
  
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange);
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    if (rowData.status == YES) {  //Only contact people who are 'yes' status
      // Generate a personalized email.
      // Given a template string, replace markers (for instance ${"First Name"}) with
      // the corresponding value in a row object (for instance rowData.firstName).
      var emailText = fillInTemplateFromObject(emailTemplate, rowData);
      var emailSubject = dataSheet.getRange("P2").getValue() + " Reminder";
      
      MailApp.sendEmail(rowData.emailAddress, emailSubject, emailText);
      
      
      // Make sure the cell is updated right away in case the script is interrupted
      SpreadsheetApp.flush();
    }
  } 
}

// Replaces markers in a template string with values define in a JavaScript data object.
// Arguments:
//   - template: string containing markers, for instance ${"Column name"}
//   - data: JavaScript object with values to that will replace markers. For instance
//           data.columnName will replace marker ${"Column name"}
// Returns a string without markers. If no data is found to replace a marker, it is
// simply removed.
function fillInTemplateFromObject(template, data) {
  var email = template;
  // Search for all the variables to be replaced, for instance ${"Column name"}
  var templateVars = template.match(/\$\{\"[^\"]+\"\}/g);

  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  for (var i = 0; i < templateVars.length; ++i) {
    // normalizeHeader ignores ${"} so we can call it directly here.
    var variableData = data[normalizeHeader(templateVars[i])];
    email = email.replace(templateVars[i], variableData || "");
  }

  return email;
}





//////////////////////////////////////////////////////////////////////////////////////////
//
// The code below is reused from the 'Reading Spreadsheet data using JavaScript Objects'
// tutorial.
//
//////////////////////////////////////////////////////////////////////////////////////////

// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range; 
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), normalizeHeaders(headers));
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}

function setMaxAttendees() {
  var max = Browser.inputBox("Please enter the maximum number of attendees:");
  var matchDigits = /^\d+$/;
  if (max.search(matchDigits) == -1) {
    Browser.msgBox("Invalid input.");  
  } else {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registration").getRange("J2").setValue(max);  
  }
}

function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: "Set Max Attendees", functionName: "setMaxAttendees"},
                      {name: "Update Waitlist", functionName: "updateWaitlist"},
                      {name: "Send Initial Emails", functionName: "sendInitialConfirmationEmail"},
                      {name: "Send Reminder Emails", functionName: "sendReminderEmail"},
                      {name: "Export Range as CSV", functionName: "saveAsCSV"}];
  ss.addMenu("Hackathon", menuEntries);
}

function saveAsCSV() {
  // Prompts the user for the file name
  var fileName = Browser.inputBox("Save CSV file as (e.g. myCSVFile):");

  // Check that the file name entered wasn't empty
  if (fileName.length !== 0) {
    // Add the ".csv" extension to the file name
    fileName = fileName + ".csv";
    // Convert the range data to CSV format
    var csvFile = convertRangeToCsvFile_(fileName);
    // Create a file in the Docs List with the given name and the CSV data
    DocsList.createFile(fileName, csvFile);
  } else {
    Browser.msgBox("Error: Please enter a CSV file name.");
  }
}

function convertRangeToCsvFile_(csvFileName) {
  // Get the selected range in the spreadsheet
  var ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSelection();
  try {
    var data = ws.getValues();
    var csvFile = undefined;

    // Loop through the data in the range and build a string with the CSV data
    if (data.length > 1) {
      var csv = "";
      for (var row = 0; row < data.length; row++) {
        for (var col = 0; col < data[row].length; col++) {
          if (data[row][col].toString().indexOf(",") != -1) {
            data[row][col] = "\"" + data[row][col] + "\"";
          }
        }

        // Join each row's columns
        // Add a carriage return to end of each row, except for the last one
        if (row < data.length-1) {
          csv += data[row].join(",") + "\r\n";
        } else {
          csv += data[row];
        }
      }
      csvFile = csv;
    }
    return csvFile;
  }
  catch(err) {
    Logger.log(err);
    Browser.msgBox(err);
  }
}