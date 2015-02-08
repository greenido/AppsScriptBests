/**
* Fetch Earning Calls dates and put them on Google Calander
* @Author: Ido Green
* @Date: Feb 2015
*/


/**
* 1. Run on your tickers
* 2. Fetch the eraning call for each.
* 3. Create a cal event.
*/
function run() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("metaData"); 
  var earningCalendar = CalendarApp.getCalendarById("TODO");
  var tickers = sheet.getRange("A:A");
  var values = tickers.getValues();
  
  for (var row in values) {
    var curTicker = values[row][0];
    Logger.log(row +") Working ticker: " + curTicker);
    if (curTicker == "" || curTicker.length < 1) {
      break;
    }
    
    // Get the earning date
    
    
    // Update a new event for this date
  }
  
}

/*
                year, month, day, hour, minute, second, millisecond
var d = new Date(99,   5,     24,  11,    33,    30,    0);
*/

//
//
//
function testGetEarningDate()  {
  getEarningDate("LULU");
  getEarningDate("LVS");
}

//
//
//
function getEarningDate(ticker) {
  try {
    var urlToFetch = "TODO" + ticker;
    var urlOptions = { "followRedirects" : true };
    var response = UrlFetchApp.fetch(urlToFetch, urlOptions);
    var text = response.getContentText();  
    var inx0 = text.indexOf("snapshot-table2");
    var inx1 = text.indexOf(">Earnings</td>", inx0 + 20);
    var inx2 = text.indexOf("<b>", inx1 + 10) + 3;
    var inx3 = text.indexOf("</b>", inx2);
    var dateStr = text.substring(inx2, inx3);
    dateStr = dateStr.replace("AMC" ,"");
    dateStr = dateStr.replace("BMO" ,"");
    Logger.log("Stock: " + ticker + " | Date: " + dateStr);
    
    var dateMonth = dateStr.substring(0,3);
    var dateMonthNum = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateMonth) / 3 + 1 ;
    
    var curMonth = new Date.now().getMonth() + 1; // 0-11
    
    var monthsGap = dateMonthNum - curMonth;

    return dateStr;      
  }
  catch(err) {
    Logger.log("Err: Could not get the date from " + urlToFetch + " * Err: " + JSON.stringify(err));
    return "N/A";

  }
  
}


//
//
//
function findOurCal() {
  var calendar = CalendarApp.getCalendarById("TODO");
  Logger.log('** The calendar is named "%s".', calendar.getName());
  
  var calendars = CalendarApp.getCalendarsByName('Earnings Release');
  Logger.log('Found %s matching calendars.', calendars.length);
  Logger.log('Our Cal: ' + JSON.stringify(calendars[0]));
  Logger.log("It got Id: " + calendars[0].getId());
}


//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Creates a simple calendar event - requires modify permissions on the
 * calendar in question.
 * For more information on using Calendar events, see
 * https://developers.google.com/apps-script/class_calendarevent.
 */
function createEvent(calendarId) {
  var cal = CalendarApp.getCalendarById(calendarId);
  var title = 'Script Demo Event';
  var start = new Date("April 1, 2012 08:00:00 PDT");
  var end = new Date("April 1, 2012 10:00:00 PDT");
  var desc = 'Created using Google Apps Script';
  var loc = 'Script Center';

  var event = cal.createEvent(title, start, end, {
      description : desc,
      location : loc
  });
};

/**
 * Creates an event, invite guests, book rooms, and sends invitation emails.
 * For more information on using Calendar events, see
 * https://developers.google.com/apps-script/class_calendarevent.
 */
function createEventInvitePeople() {
  var calId = 'your_cal_id';
  var room1CalId = 'a_room_cal_id';
  var room2CalId = 'another_room_cal_id';
  var guest1Email = 'guest1@yourdomain.com';
  var guest2Email = 'guest2@yourdomain.com';
  var invitees = room1CalId + ',' + room2CalId + ',' + guest1Email + ',' +
      guest2Email;

  var cal = CalendarApp.getCalendarById(calId);
  var title = 'Script Center Demo Event';
  var start = new Date("April 1, 2012 08:00:00 PDT");
  var end = new Date("April 1, 2012 10:00:00 PDT");
  var desc = 'Created using Apps Script';
  var loc = 'Script Center';
  var send = 'true';

  var event = cal.createEvent(title, start, end, {
      description : desc,
      location : loc,
      guests : invitees,
      sendInvites : send
  });
};

/**
 * Creates an event that recurs weekly for 10 weeks. These settings
 * are very simple; recurring events can become quite complex. Search for
 * 'google apps script class recurrence' to get more details.
 * For more information on using Calendar events, see
 * https://developers.google.com/apps-script/class_calendarevent.
 */
function createEventSeries() {
  var calId = 'your_cal_id';
  var cal = CalendarApp.getCalendarById(calId);
  var title = 'Script Center Demo Recurring Event';
  var start = new Date("April 1, 2012 08:00:00 PDT");
  var end = new Date("April 1, 2012 10:00:00 PDT");
  var desc = 'Created using Apps Script';
  var loc = 'Script Center';

  var recurrence = CalendarApp.newRecurrence();
  recurrence.addWeeklyRule().times(10);
  var series = cal.createEventSeries(title, start, end, recurrence, {
      description : desc,
      location : loc
  });
};
