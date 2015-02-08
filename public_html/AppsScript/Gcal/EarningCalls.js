/**
* Fetch Earning Calls dates and put them on Google Calander
* @Author: Ido Green
* @Date: Feb 2015
*/



/**
* 0. Delete all the old/current events.
* 1. Run on your tickers
* 2. Fetch the eraning call for each.
* 3. Create a cal event.
*/
function createEraningCallsEvents() {
  
  // start with a clean cal
  deleteAllEarningEvents();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("metaData"); 
  var earningCalendar = CalendarApp.getCalendarById("TODO-email");
  
  var tickers = sheet.getRange("A:A");
  var values = tickers.getValues();
  
  for (var row in values) {
    var ticker = values[row][0];
    Logger.log(row +") Working ticker: " + ticker);
    if (ticker === "" || ticker.length < 1) {
      break;
    }
    
    // get the earning date
    var d = getEarningDate(ticker);
    if (d !== "N/A") {
      // update a new event for this date
      createEvent(earningCalendar, d, ticker);
    }
    else {
      Logger.log("Could not add event for: " + ticker + " because didn't get a date");
    }
  }
  
}

//
// Delete all the events we currently have in our cal.
//
function deleteAllEarningEvents() {
  var earningCalendar = CalendarApp.getCalendarById("TODO-email");
  var now = new Date();
  var aYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
  var events = earningCalendar.getEvents(now, aYearFromNow, {search: 'Earning call'});
  Logger.log('Number of events: ' + events.length);
  for (var i=0; i < events.length; i++) {
    events[i].deleteEvent();
  }
  Logger.log("Removed all the events");
}

//
// unit test for getting the date from finviz
//
function testGetEarningDate()  {
  var d1 = getEarningDate("GOLD");
  Logger.log("GOLD for: " + JSON.stringify(d1));
  
  var d2 = getEarningDate("LVS");
  Logger.log("LVS for: " + JSON.stringify(d2));
}

//
// Return the eraning date
//                  year, month, day, hour, minute, second, millisecond
//  var d = new Date(99,   5,     24,  11,    33,    30,    0);
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
    var dateDay = dateStr.substring(4);
    var dateMonthNum = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(dateMonth) / 3 + 1 ;
    
    var curMonth = ( (new Date()).getMonth() ) + 1; // 0-11
    var curYear = (new Date()).getYear();
    var monthsGap = dateMonthNum - curMonth;

    if (monthsGap >= 0 && monthsGap < 5) {
      var d = new Date( curYear, dateMonthNum - 1, dateDay , 22, 30, 00, 0);
      return d;
    } else {
      if (curMonth > 9) {
        // let's check if we have a month 10,11,12 or later: 1,2,3
        if (dateMonthNum > 9 || dateMonthNum <= 12) {
          var d = new Date( curYear, dateMonthNum - 1, dateDay , 22, 30, 00, 0);
          return d;
        } else {
          if (dateMonthNum > 0 || dateMonthNum <= 3) {
            var d = new Date( curYear+1, dateMonthNum - 1, dateDay , 22, 30, 00, 0);
            return d;
          }
        }
      }
      else {
        Logger.log("** Warning: The earning month is: " + dateMonth +
                "  (and we are at: " + curMonth +
                ") which does not make sense - so we skip it");
      }
    }
         
  }
  catch(err) {
    Logger.log("Err: Could not get the date from " + urlToFetch +
            " * Err: " + JSON.stringify(err));
  }
  
  return "N/A";  
}


//
// Helper function to get cal id/name/params
//
function findOurCal() {
  var calendar = CalendarApp.getCalendarById("TODO-email");
  Logger.log('** The calendar is named "%s".', calendar.getName());
  
  var calendars = CalendarApp.getCalendarsByName('Earnings Release');
  Logger.log('Found %s matching calendars.', calendars.length);
  Logger.log('Our Cal: ' + JSON.stringify(calendars[0]));
  Logger.log("It got Id: " + calendars[0].getId());
}

//
// Unit test for creating a new calendar event
//
function testCreateEvent() {
  var calendar = CalendarApp.getCalendarById("TODO-email");
  var d = new Date( 2015, 1, 10 , 20, 30, 00, 0);
  createEvent(calendar, d, "MOMO");
}

/**
 * Creates a  calendar event for the Eraning call
 * For more information on using Calendar events, see
 * https://developers.google.com/apps-script/class_calendarevent.
 * @param {type} cal - our cal for this calls
 * @param {type} sDate - the start date for the event
 * @param {type} ticker - the ticker for the company
 * @returns nothing
 */
function createEvent(cal, sDate, ticker) {
  var title = 'Earning call: ' + ticker;
  var start = sDate;
  var end = new Date(sDate.getTime() + (30 * 60 * 1000));
  var desc = 'Earning Call for ' + ticker;

  var event = cal.createEvent(title, start, end, {
      description : desc
  });
  Logger.log("Created event: " + JSON.stringify(event));
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
