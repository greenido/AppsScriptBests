/**
 * Fetch Mails from a certain label and put them (after a little parsing) 
 * in a nice sheet.
 * Later, we can work on them in the sheet or export the data (CSV, anyone?)
 * to work on it offline with a good/little DB.
 * 
 * @Author: Ido Green | @greenido | +GreenIdo
 * @Date: Feb 2015
 */



//
// Run on all the emails that we have under label: investing/News/bloomberg
// Parse the news item from each email and save it into the sheet.
//
function fetchNews() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("raw-news");

  var label = GmailApp.getUserLabelByName("TODO");

  // We will use this meta data sheet to keep track on what is going on with the process
  var metaDataS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("metaData");
  var curRow = ss.getLastRow() + 1;
  if (curRow < 2) {
    // Let's make sure we won't erase our headers (never).
    curRow = 2;
  }
  metaDataS.getRange('B3').setValue(curRow);
  var amountOfThreads = 10;

  for (var from = metaDataS.getRange('B1').getValue(); from < 1000; from = from + amountOfThreads) {
    metaDataS.getRange('B1').setValue(from);
    metaDataS.getRange('B2').setValue(from + amountOfThreads);
    var threads = label.getThreads(from, amountOfThreads);

    for (var i = 0; i < threads.length; i++) {
      metaDataS.getRange('B1').setValue(from + i);
      var message = threads[i].getMessages()[0];
      var body = message.getPlainBody();
      var subject = message.getSubject();
      var msgDate = message.getDate();
      var id = message.getId();

      Logger.log(i + ") msg: " + id + " On: " + msgDate); // + " text: "+body);
      var items = breakNewsToItems(body);
      Logger.log("We got: " + items);
      for (var k = 1; k < items.length; k++) {
        ss.getRange('A' + curRow).setValue(id + "-" + k);
        ss.getRange('B' + curRow).setValue(msgDate);
        ss.getRange('C' + curRow).setValue(items[k]);
        curRow++;
        metaDataS.getRange('B3').setValue(curRow);
      }
    }
  }
  //
  SpreadsheetApp.getActiveSpreadsheet().toast("Hey, We are done! All the news are here.", "OK", 10);
}

// This is how a news Item looks like:
//
//x) bla-bla
//<GO>
//
// Return: array of news items
function breakNewsToItems(rawText) {
  items = [];
  for (var i = 1; i < 20; i++) {
    var indexStr = i + ")";
    var inx1 = rawText.indexOf(indexStr);
    if (inx1 > 0) {
      var inx2 = rawText.indexOf("<GO>", inx1 + 15);
      var newsItem = rawText.substring(inx1, inx2);
      items[i] = newsItem;
    }
    else {
      break;
    }
  }
  //
  Logger.log("Found " + i + " Items");
  return items;
}
