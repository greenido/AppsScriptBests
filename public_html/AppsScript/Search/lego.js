/**
* Fetch lego emails from Gmail and add YT videos and images per subject.
* @Author: Ido Green
* @Date: JAN 2015
*
* Psst... follow the TODOs so it will work.
*/


/**
 * Main menu
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('אמיר לגו חלל')
      .addItem('הבא מיילים', 'getLegoMsg')
      .addToUi();
}

/**
 * Get all the lego emails and put their subject (=url) in a cell 
 */
function getLegoMsg() {
 var ss = SpreadsheetApp.getActiveSheet();

 var label = GmailApp.getUserLabelByName("LEGO");
 var threads = label.getThreads(0, 30);
 var j=2;
 for (var i = 0; i < threads.length; i++) {
   var subject = threads[i].getFirstMessageSubject();
   if (subject.indexOf("amazon") > 1 ) {
     ss.getRange('A'+j).setValue(subject);
     var inx1 = subject.indexOf('/', 25);
     var legoTitle = subject.substring(22, inx1);
     fetchImages(legoTitle, j, ss);
     fetchVideo(legoTitle, j, ss);
     j++;
   }
 }
  SpreadsheetApp.getActiveSpreadsheet().toast("Hey, We are done! All the Legos are here.", "OK :)", 10);
}

function fetchImages(legoTitle, curRow, ss) {
  var url = "https://www.googleapis.com/customsearch/v1?cx=TODO&q=" +legoTitle +
      "&imgSize=medium&key=TODO";
  var json = UrlFetchApp.fetch(url).getContentText();
  var data = JSON.parse(json);
  
  var img1 = data.items[0].pagemap.cse_image[0].src;
  Logger.log("Got from search: " + img1);
  var imgTag = '=image("' + img1 + '")';
  ss.getRange('B'+curRow).setValue(imgTag);  
}

//
//
// https://gdata.youtube.com/feeds/api/videos?q=lego-star-war&v=2
function fetchVideo(legoTitle, curRow, ss) {
  var url = "https://gdata.youtube.com/feeds/api/videos?q=" + legoTitle +"&v=2&alt=json";
  var json = UrlFetchApp.fetch(url).getContentText();
  var data = JSON.parse(json);
  
  if (data.feed.entry === undefined) {
    ss.getRange('C'+curRow).setValue("No video");  
  }
  else {
    var video1 = data.feed.entry[0];
    var video1title = video1.title.$t;
    var video1url = video1.link[0].href;
    // update the sheet
    ss.getRange('C'+curRow).setValue(video1title);  
    ss.getRange('D'+curRow).setValue(video1url);  
    ss.getRange('E'+curRow).setValue(data.feed.entry[1].link[0].href);  
    ss.getRange('F'+curRow).setValue(data.feed.entry[2].link[0].href);  
  }
}


/**
 * Retrieves all inbox threads and logs the respective subject lines.
 * For more information on using the GMail API, see
 * https://developers.google.com/apps-script/class_gmailapp
 */
function processInbox() {
  // get all threads in inbox
  var threads = GmailApp.getInboxThreads();
  for (var i = 0; i < threads.length; i++) {
    // get all messages in a given thread
    var messages = threads[i].getMessages();
    // iterate over each message
    for (var j = 0; j < messages.length; j++) {
      // log message subject
      Logger.log(messages[j].getSubject());
    }
  }
};

/**
 * Retrieves a given user label by name and logs the number of unread threads
 * associated with that that label.
 * For more information on interacting with GMail labels, see
 * https://developers.google.com/apps-script/class_gmaillabel
 * 
 * @ labelName - the label we wish to work on.
 */
function processLabel(labelName) {
  // get the label for given name
  var label = GmailApp.getUserLabelByName(labelName);
  // get count of all threads in the given label
  var threadCount = label.getUnreadCount();
  Logger.log(threadCount);
};


