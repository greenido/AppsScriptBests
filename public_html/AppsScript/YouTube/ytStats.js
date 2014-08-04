/**
* Ido's YouTube Dashboard Stats example
* Fetch stats on videos and channel by using YT APIs.
  1. It using the ATOM feeds - v1.
  2. For the channel we are using the v3 version of the API.

* @Author: Ido Green
* @Date: Aug 2014
*
*/


/**
 * This function uses the YouTube Analytics API to fetch data about the
 * authenticated user's channel, creating a new Google Sheet in the user's Drive
 * with the data.
 *
 * The first part of this sample demonstrates a simple YouTube Analytics API
 * call. This function first fetches the active user's channel ID. Using that
 * ID, the function makes a YouTube Analytics API call to retrieve views,
 * likes, dislikes and shares for the last 30 days. The API returns the data
 * in a response object that contains a 2D array.
 *
 * The second part of the sample constructs a Spreadsheet. This spreadsheet
 * is placed in the authenticated user's Google Drive with the name
 * 'YouTube Report' and date range in the title. The function populates the
 * spreadsheet with the API response, then locks columns and rows that will
 * define a chart axes. A stacked column chart is added for the spreadsheet.
 
 
 @see: 
 * https://developers.google.com/youtube/analytics/v1/code_samples/apps-script
 * https://developers.google.com/youtube/analytics/sample-requests#channel-time-based-reports
 * https://developers.google.com/apis-explorer/#p/youtubeAnalytics/v1/youtubeAnalytics.reports.query
 
 
 */
function spreadsheetAnalytics() {
  // Get the channel ID
  var myChannels = YouTube.Channels.list('id', {mine: true});
  var channel = myChannels.items[0];
  var channelId = channel.id;
  // Set the dates for our report
  var today = new Date();
  var monthAgo12 = new Date();
  monthAgo12.setMonth(today.getMonth() - 11);
  var todayFormatted = Utilities.formatDate(today, 'UTC', 'yyyy-MM-dd')
  var oneMonthAgoFormatted = Utilities.formatDate(monthAgo12, 'UTC', 'yyyy-MM-dd');

  // The YouTubeAnalytics.Reports.query() function has four required parameters and one optional
  // parameter. The first parameter identifies the channel or content owner for which you are
  // retrieving data. The second and third parameters specify the start and end dates for the
  // report, respectively. The fourth parameter identifies the metrics that you are retrieving.
  // The fifth parameter is an object that contains any additional optional parameters
  // (dimensions, filters, sort, etc.) that you want to set.
  var analyticsResponse = YouTubeAnalytics.Reports.query(
    'channel==' + channelId,
    oneMonthAgoFormatted,
    todayFormatted,
    // dimensions=day      metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained
    'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,dislikes,shares',
    {
      dimensions: 'day',
      sort: '-day'
    });

  // Create a new Spreadsheet with rows and columns corresponding to our dates
  var ssName = 'YouTube channel report ' + oneMonthAgoFormatted + ' - ' + todayFormatted;
  var numRows = analyticsResponse.rows.length;
  var numCols = analyticsResponse.columnHeaders.length;

  // Add an extra row for column headers
  var ssNew = SpreadsheetApp.create(ssName, numRows + 1, numCols);

  // Get the first sheet
  var sheet = ssNew.getSheets()[0];

  // Get the range for the title columns
  // Remember, spreadsheets are 1-indexed, whereas arrays are 0-indexed
  var headersRange = sheet.getRange(1, 1, 1, numCols);
  var headers = [];

  // These column headers will correspond with the metrics requested
  // in the initial call: views, likes, dislikes, shares
  for(var i in analyticsResponse.columnHeaders) {
    var columnHeader = analyticsResponse.columnHeaders[i];
    var columnName = columnHeader.name;
    headers[i] = columnName;
  }
  // This takes a 2 dimensional array
  headersRange.setValues([headers]);

  // Bold and freeze the column names
  headersRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Get the data range and set the values
  var dataRange = sheet.getRange(2, 1, numRows, numCols);
  dataRange.setValues(analyticsResponse.rows);

  
  // Bold and freeze the dates
  var dateHeaders = sheet.getRange(1, 1, numRows, 1);
  dateHeaders.setFontWeight('bold');
  sheet.setFrozenColumns(1);

  // Include the headers in our range. The headers are used
  // to label the axes
  var range = sheet.getRange(1, 1, numRows, numCols);
  var chart = sheet.newChart()
                   .asColumnChart()
                   .setStacked()
                   .addRange(range)
                   .setPosition(4, 2, 10, 10)
                   .build();
  sheet.insertChart(chart);

}

//
// A Helper function to extract the ID of our video
// It works both on version of links:
// 1. https://www.youtube.com/watch?v=BuHEhmp47VE
// 2. http://youtu.be/75EuHl6CSTo
//
function extractVideoID() {
  var curSheet = SpreadsheetApp.getActiveSheet();
  var ytLinks = curSheet.getRange("D:D");
  var totalRows = ytLinks.getNumRows();
  var ytVal = ytLinks.getValues();
  // let's run on the rows
  for (var i = 1; i <= totalRows - 1; i++) {
    var curLink = ytVal[i][0];
    if (curLink == "") {
      break;
    }
    
    var videoID = "";
    var inx1 = curLink.indexOf('watch?v=') + 8;
    if (inx1 == 7) {
      // check if it's the short format: http://youtu.be/75EuHl6CSTo
      if (curLink != "" && curLink.indexOf("youtu.be") > 0) {
        videoID = curLink.substr(16, curLink.length);  
      }
    }
    else {
      // we have the link in this format: https://www.youtube.com/watch?v=YIgSucMNFAo
      var inx2 = curLink.indexOf("&", inx1);
      
      if (inx2 > inx1) {
        videoID = curLink.substr(inx1, inx2-inx1);
      } else {
        videoID = curLink.substr(inx1, curLink.length);
      }
    }
    
    curSheet.getRange("E" + (i+1)).setValue(videoID);
  }
  var htmlMsg = HtmlService
  .createHtmlOutput('<h3>Done - Please check the IDs on Column D:D</h3>').setTitle('YT Dashboard Example').setWidth(450).setHeight(300);
  SpreadsheetApp.getActiveSpreadsheet().show(htmlMsg);
}

//
// Run on all the rows and according to the video ID fetch the feed
//
function fetchAllData() {
  var start = new Date().getTime();
  
  var curSheet = SpreadsheetApp.getActiveSheet();
  var ytIds = curSheet.getRange("E:E");
  var totalRows = ytIds.getNumRows();
  var ytVal = ytIds.getValues();
  var errMsg = "<h4>Errors:</h4> <ul>";
  // let's run on the rows after the header row
  for (var i = 1; i <= totalRows - 1; i++) {
    // e.g. for a call: https://gdata.youtube.com/feeds/api/videos/YIgSucMNFAo?v=2&prettyprint=true
    if (ytVal[i] == "") {
      Logger.log("We stopped at row: " + (i+1));
      break;
    }
    var link = "https://gdata.youtube.com/feeds/api/videos/" + ytVal[i] + "?v=2&prettyprint=true";
    try {
      fetchYTdata(link, i+1);
    }
    catch (err) {
      errMsg += "<li>Line: " + i + " we could not fetch data for ID: " + ytVal[i] + "</li>";
      Logger.log("*** ERR: We have issue with " + ytVal[i] + " On line: " + i);
    }
  }
  
  var end = new Date().getTime();
  var execTime = (end - start) / 1000;
  var htmlApp = HtmlService
  .createHtmlOutput('<h2>Done updating!</h2><p>It took us: '+ execTime + 'sec. to update: ' +
                    (i+1) + ' videos</p>' + errMsg).setTitle('GStudio Rock').setWidth(450).setHeight(450);
   SpreadsheetApp.getActiveSpreadsheet().show(htmlApp);
}


//
// Read YT stats data on our videos and fill the sheet with the data
//
function fetchYTdata(url, curRow) {
   //var url = 'https://gdata.youtube.com/feeds/api/videos/Eb7rzMxHyOk?v=2&prettyprint=true';
   var rawData = UrlFetchApp.fetch(url).getContentText();
   //Logger.log(rawData);
                           
  // published <published>2014-05-09T06:22:52.000Z</published>
   var inx1 = rawData.indexOf('published>') + 10;
   var inx2 = rawData.indexOf("T", inx1);
   var publishedDate = rawData.substr(inx1, inx2-inx1);
  
   // viewCount='16592'
   var inx1 = rawData.indexOf('viewCount') + 11;
   var inx2 = rawData.indexOf("'/>", inx1);
   var totalViews = rawData.substr(inx1, inx2-inx1);
  
   // <yt:duration seconds='100'/>
   var inx1 = rawData.indexOf('duration seconds') + 18;
   var inx2 = rawData.indexOf("'/>", inx1);
   var durationSec = rawData.substr(inx1, inx2-inx1);
  
   Logger.log(curRow + ") TotalViews: " + totalViews + " durationSec: " + durationSec);
   
  // update the sheet
  var ss = SpreadsheetApp.getActiveSheet();
  ss.getRange("C" + curRow).setValue(publishedDate);
  ss.getRange("G" + curRow).setValue(totalViews);
  ss.getRange("H" + curRow).setValue(durationSec);
  
 }
 
//
// Our custom menu 
//
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{ name : "Update Stats", functionName : "fetchAllData"},
                 { name : "Extract Video IDs", functionName : "extractVideoID"}
                ];
  spreadsheet.addMenu("YT Dashboard", entries);
};
