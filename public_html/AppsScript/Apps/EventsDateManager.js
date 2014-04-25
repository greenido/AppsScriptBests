// EventManagerV3 glued together by mhawksey http://www.google.com/profiles/m.hawksey
// Related blog post http://mashe.hawksey.info/eventmanagerv3/
// With some code (settings, importIntoCalendar, sendEmails) from
// Romain Vialard's http://www.google.com/profiles/romain.vialard
// Manage your events: Calendar Importer and Registration Form
// https://spreadsheets.google.com/ccc?key=tCHuQkkKh_r69bQGt4yJmNQ
var ss = SpreadsheetApp.getActiveSpreadsheet();
var BOOKING_ACTION_COL = 10;
function onOpen() {
  var conf = ss.getSheetByName("Templates").getRange("B3").getValue();
  if (conf == "") {
    ss.toast("Click on setup to start", "Welcome", 10);
  }
  var menuEntries = [{name: "Process Events", functionName: "importIntoCalendar"}, {name: "Process Bookings", functionName: "sendBookingConf"}, {name: "Email joining instructions", functionName: "sendJoinEmails"}];
  ss.addMenu("Event Manager", menuEntries);
}
function settings() {
  var calendarName = Browser.inputBox("First create a calendar in Google Calendar and enter its name here:");
  if (calendarName != "cancel" && calendarName != "") {
    var templateSheet = ss.getSheetByName("Templates");
    templateSheet.getRange("E1").setValue(calendarName);
    var formURL = ss.getFormUrl();
    templateSheet.getRange("B3").setValue(formURL);
    var calTimeZone = CalendarApp.openByName(calendarName).getTimeZone();
    ss.setSpreadsheetTimeZone(calTimeZone);
    var timeZone = ss.getSpreadsheetTimeZone();
    var siteUrl = Browser.inputBox("If you would like to update events to a Sites page enter your announcement page url");
    if (siteUrl != "cancel" && siteUrl != "") {
      templateSheet.getRange("E2").setValue(siteUrl);
    }
    var adminEmail = Browser.inputBox("Please enter your administrator email address");
    if (adminEmail != "cancel" && adminEmail != "") {
      templateSheet.getRange("B4").setValue(adminEmail);
    }
    ss.toast("You can now import events in your calendar. Time Zone is currently set to: " + timeZone + ".", "Set up completed!", -1);
    SpreadsheetApp.flush();
  }
}
function importIntoCalendar() {
  var dataSheet = ss.getSheetByName("Put your events here");
  var dataRange = dataSheet.getRange(2, 1, dataSheet.getMaxRows(), dataSheet.getMaxColumns());
  var templateSheet = ss.getSheetByName("Templates");
  var calendarName = templateSheet.getRange("E1").getValue();
  var siteUrl = templateSheet.getRange("E2").getValue();
  if (calendarName != "") {
    var cal = CalendarApp.getCalendarsByName(calendarName)[0];
    var eventTitleTemplate = templateSheet.getRange("E3").getValue();
    var descriptionTemplate = templateSheet.getRange("E4").getValue();
    // Create one JavaScript object per row of data.
    objects = getRowsData(dataSheet, dataRange);
    // For every row object, create a personalized email from a template and send
    // it to the appropriate person.
    for (var i = 0; i < objects.length; ++i) {
      // Get a row object
      var rowData = objects[i];
      if (rowData.eventId && rowData.eventTitle && rowData.action == "Y") {
        var eventTitle = fillInTemplateFromObject(eventTitleTemplate, rowData);
        var description = fillInTemplateFromObject(descriptionTemplate, rowData);
        // add to calendar bit
        if (rowData.endDate == "All-day") {
          cal.createAllDayEvent(eventTitle, rowData.startDate, rowData.endDate, {location: rowData.location, description: description}).addEmailReminder(15).setTag("Event ID", rowData.eventId);
        }
        else {
          cal.createEvent(eventTitle, rowData.startDate, rowData.endDate, {location: rowData.location, description: description}).addEmailReminder(15).setTag("Event ID", rowData.eventId);
        }
        // add to site bit
        if (siteUrl != "") {
          var page = SitesApp.getPageByUrl(siteUrl);
          var announcement = page.createAnnouncement(rowData.eventTitle, description);
        }
        // create event sheet
        var temp = ss.getSheetByName("EventTMP");
        var eventSheet = ss.insertSheet("Event " + rowData.eventId, {template: temp});
        eventSheet.getRange(1, 2, 1, 1).setValue(rowData.numberOfPlaces);
        eventSheet.getRange(1, 3, 1, 1).setValue(rowData.eventTitle);
        eventSheet.getRange(2, 3, 1, 1).setValue(rowData.location);
        eventSheet.getRange(3, 6, 1, 1).setValue(rowData.startDate);
        eventSheet.getRange(3, 8, 1, 1).setValue(rowData.endDate);
        dataSheet.getRange(i + 2, 1, 1, 1).setValue("");
        dataSheet.getRange(i + 2, 2, 1, 1).setValue("Added " + new Date()).setBackgroundRGB(221, 221, 221);
        dataSheet.getRange(i + 2, 1, 1, dataSheet.getMaxColumns()).setBackgroundRGB(221, 221, 221);
        // Make sure the cell is updated right away in case  the script is interrupted
        SpreadsheetApp.flush();
      }
    }
    ss.toast("People can now register to those events", "Events imported");
  }
}
function onFormSubmit() {
  var dataSheet = ss.getSheetByName("Bookings");
  var dataRange = dataSheet.getRange(2, 1, dataSheet.getMaxRows(), dataSheet.getMaxColumns());
  var templateSheet = ss.getSheetByName("Templates");
  var emailTemplate = templateSheet.getRange("E6").getValue();
  var adminEmail = templateSheet.getRange("B4").getValue()
  // Create one JavaScript object per row of data.
  data = getRowsData(dataSheet, dataRange);
  for (var i = 0; i < data.length; ++i) {
    // Get a row object
    var row = data[i];
    row.rowNumber = i + 2;
    if (!row.action) { // if no state notify admin of booking
      var emailText = fillInTemplateFromObject(emailTemplate, row);
      var emailSubject = "Booking Approval Request ID: " + row.rowNumber;
      MailApp.sendEmail(adminEmail, emailSubject, emailText);
      dataSheet.getRange(row.rowNumber, BOOKING_ACTION_COL).setValue("TBC"); //9 is the column number for 'Action'
    }
  }
}
function sendBookingConf() {
  var dataSheet = ss.getSheetByName("Bookings");
  var dataRange = dataSheet.getRange(2, 1, dataSheet.getMaxRows(), dataSheet.getMaxColumns());
  var templateSheet = ss.getSheetByName("Templates");
  var emailSubjectTemplate = templateSheet.getRange("B1").getValue();
  var emailTemplate = templateSheet.getRange("B2").getValue();
  var emailSentColumn = BOOKING_ACTION_COL;
  // To add guests into Calendar
  var calendarDataSheet = ss.getSheetByName("Put your events here");
  var calendarDataRange = calendarDataSheet.getRange(2, 1, calendarDataSheet.getMaxRows(), calendarDataSheet.getMaxColumns());
  var calendarName = templateSheet.getRange("E1").getValue();
  // Create one JavaScript object per row of data.
  calendarObjects = getRowsData(calendarDataSheet, calendarDataRange);
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange);
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    if (rowData.action == "Y") {  // Prevents  sending duplicates
      // add guest in calendar
      for (var j = 0; j < calendarObjects.length; ++j) {
        // Get a row object
        var calendarRowData = calendarObjects[j];
        if (calendarRowData.eventId == rowData.eventId) {
          var cal = CalendarApp.openByName(calendarName);
          if (calendarRowData.endDate == "All-day") {
            var getDate = new Date(calendarRowData.startDate).getTime();
            var endDate = new Date().setTime(getDate + 86400000);
            var events = cal.getEvents(new Date(calendarRowData.startDate), new Date(endDate));
          }
          else {
            var events = cal.getEvents(new Date(calendarRowData.startDate), new Date(calendarRowData.endDate));
          }
          for (var k in events) {
            if (events[k].getTag("Event ID") == rowData.eventId) {
              events[k].addGuest(rowData.email);
              j = calendarObjects.length;
            }
          }
        }
      }
      // Generate a personalized email.
      // Given a template string, replace markers (for instance ${"First Name"}) with
      // the corresponding value in a row object (for instance rowData.firstName).
      calendarRowData.bookingId = rowData.eventId + "-B" + (i + 2);
      calendarRowData.firstName = rowData.firstName;
      var emailSubject = fillInTemplateFromObject(emailSubjectTemplate, calendarRowData);
      var emailText = fillInTemplateFromObject(emailTemplate, calendarRowData);
      var emailAddress = rowData.email;
      MailApp.sendEmail(emailAddress, emailSubject, emailText, {htmlBody: emailText});
      // add booking to right event sheet
      dataSheet.getRange(i + 2, emailSentColumn).setValue(calendarRowData.bookingId).setBackgroundRGB(221, 221, 221);
      var eventSheet = ss.getSheetByName("Event " + rowData.eventId);
      var rowNum = eventSheet.getLastRow() + 1;
      eventSheet.getRange(rowNum, 3, 1, 1).setValue(calendarRowData.bookingId);
      eventSheet.getRange(rowNum, 4, 1, 1).setValue(rowData.timestamp);
      eventSheet.getRange(rowNum, 5, 1, 1).setValue(rowData.firstName);
      eventSheet.getRange(rowNum, 6, 1, 1).setValue(rowData.lastName);
      eventSheet.getRange(rowNum, 7, 1, 1).setValue(rowData.email);
      eventSheet.getRange(rowNum, 8, 1, 1).setValue(rowData.organisationName);
      eventSheet.getRange(rowNum, 9, 1, 1).setValue(rowData.startPostcode);
      eventSheet.getRange(rowNum, 10, 1, 1).setValue(rowData.preferredMode);
      eventSheet.getRange(rowNum, 11, 1, 1).setValue(rowData.otherInfo);
      eventSheet.getRange(rowNum, 12, 1, 1).setValue(rowData.comments);
      // Make sure the cell is updated right away in case  the script is interrupted
      // Add delegate to Contacts
      var curDate = Utilities.formatDate(new Date(), "GMT", "dd/MM/yy HH:mm");
      var c = ContactsApp.findByEmailAddress(rowData.email);
      if (!c) {
        var c = ContactsApp.createContact(rowData.firstName, rowData.lastName, rowData.email);
        var prop = {};
        prop.Organisation = rowData.organisationName;
        prop.Added = curDate;
        c.setUserDefinedFields(prop);
        var group = ContactsApp.findContactGroup(rowData.organisationName);
        if (!group) {
          var group = ContactsApp.createContactGroup(rowData.organisationName);
        }
        c.addToGroup(group);
      } else {
        c.setUserDefinedField("Last activity", curDate);
      }
      SpreadsheetApp.flush();
    }
  }
  ss.toast("", "Emails sent", -1);
}
// Code to send joining instructions - based on simple mail merge code from
// Tutorial: Simple Mail Merge
// Hugo Fierro, Google Spreadsheet Scripts Team
// March 2009
function sendJoinEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getActiveSheet();
  var eventName = ss.getRange("C1").getValue();// pull event name from sheet
  var location = ss.getRange("C2").getValue();// pull event location
  var emailCount = 0;
  var dataRange = dataSheet.getRange(5, 3, dataSheet.getMaxRows(), dataSheet.getMaxColumns());
  var templateSheet = ss.getSheetByName("Templates");
  var emailTemplate = templateSheet.getRange("B6").getValue();
  var emailSubject = templateSheet.getRange("B5").getValue();
  emailSubject = emailSubject.replace('${"Event Name"}', eventName);
  // Create one JavaScript object per row of data.
  objects = getRowsData(dataSheet, dataRange, 4);
  // For every row object, create a personalized email from a template and send
  // it to the appropriate person.
  for (var i = 0; i < objects.length; ++i) {
    // Get a row object
    var rowData = objects[i];
    rowData.eventName = eventName;
    rowData.rowNumber = i + 5;
    // Generate a personalized email.
    if (!rowData.emailed) {
      if (rowData.startPostcode && (location != "Online" || location)) {
        rowData.directions = getMapDirections_(rowData.startPostcode, location, rowData.mode);
      }
      var emailText = fillInTemplateFromObject(emailTemplate, rowData);
      try {
        MailApp.sendEmail(rowData.emailAddress, emailSubject, 'Please view in HTML capable email client.', {htmlBody: emailText});
        emailCount++;
        dataSheet.getRange(rowData.rowNumber, 2).setValue(Utilities.formatDate(new Date(), "GMT", "dd/MM/yy HH:mm"));
      } catch (e) {
        Browser.msgBox("There was a problem sending to " + rowData.emailAddress);
      }
    }
  }
  ss.toast("Joining instructions have been sent to " + emailCount + " delegates", "Joining instructions sent", 5);
}


// Modified from Send customized driving directions in a mail merge template
// http://code.google.com/googleapps/appsscript/templates.html
function getMapDirections_(start, end, mode) {
  // Generate personalized static map with directions.
  switch (mode)
  {
    case "Cycling":
      var directions = Maps.newDirectionFinder()
              .setOrigin(start)
              .setDestination(end)
              .setMode(Maps.DirectionFinder.Mode.BICYCLING)
              .getDirections();
      break;
    case "Walking":
      var directions = Maps.newDirectionFinder()
              .setOrigin(start)
              .setDestination(end)
              .setMode(Maps.DirectionFinder.Mode.WALKING)
              .getDirections();
      break;
    default:
      var directions = Maps.newDirectionFinder()
              .setOrigin(start)
              .setDestination(end)
              .setMode(Maps.DirectionFinder.Mode.DRIVING)
              .getDirections();
  }
  var currentLabel = 0;
  var directionsHtml = "";
  var map = Maps.newStaticMap().setSize(500, 350);
  map.setMarkerStyle(Maps.StaticMap.MarkerSize.SMALL, "red", null);
  map.addMarker(start);
  map.addMarker(end);
  var r1 = new RegExp('<div style="font-size: 0.9em;">', 'g');
  var r2 = new RegExp('</div>', 'g');
  var points = [];
  var distance = 0;
  var time = 0;
  for (var i in directions.routes) {
    for (var j in directions.routes[i].legs) {
      for (var k in directions.routes[i].legs[j].steps) {
        var step = directions.routes[i].legs[j].steps[k];
        distance += directions.routes[i].legs[j].steps[k].distance.value;
        time += directions.routes[i].legs[j].steps[k].duration.value;
        var path = Maps.decodePolyline(step.polyline.points);
        points = points.concat(path);
        var text = step.html_instructions;
        text = text.replace(r1, '');
        text = text.replace(r2, '');
        directionsHtml += "" + (++currentLabel) + " - " + text;
      }
    }
  }
  // be conservative, and only sample 100 times...
  var lpoints = [];
  if (points.length < 200)
    lpoints = points;
  else {
    var pCount = (points.length / 2);
    var step = parseInt(pCount / 100);
    for (var i = 0; i < 100; ++i) {
      lpoints.push(points[i * step * 2]);
      lpoints.push(points[(i * step * 2) + 1]);
    }
  }
  // make the polyline   if (lpoints.length>0) {
  var pline = Maps.encodePolyline(lpoints);
  map.addPath(pline);


  var mapLink = "<a href='http://maps.google.com/maps?saddr=' + encodeURIComponent(start) + '&daddr=' + encodeURIComponent(end)+''>Click here for complete map and directions</a>";
  var dir = '<strong>Travel Directions</strong><img src="\" alt="">' + mapLink +
          "<strong>Summary of Route</strong>" + "<strong>Distance: </strong>" +
          Math.round(0.00621371192 * distance) / 10 + " miles" +
          "<strong>Time: </strong>" +
          Math.floor(time / 60) + " minutes" + directionsHtml;
  return dir;
}