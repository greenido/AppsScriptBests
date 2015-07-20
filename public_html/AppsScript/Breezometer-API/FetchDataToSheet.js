/**
* Fetch Data from http://api-beta.breezometer.com/baqi/?location=new+york&key=YOURKEY
* @Author: Ido Green | @greenido | +GreenIdo
* @Date: July 2015

A sample return object:
-----------------------
key_valid	TRUE
breezometer_description	Fair Air Quality
breezometer_aqi	65
data_valid	TRUE
dominant_pollutant_canonical_name	pm2.5
country_description	Good Air Quality
country_color	#92F300
breezometer_color	#A2DB26
country_aqi	43
dominant_pollutant_description	Fine particulate matter (<2.5µm)
dominant_pollutant_text	{effects=Particles enter the lungs and cause local and systemic inflammation in the respiratory system & heart, thus cause cardiovascular and respiratory diseases such as asthma and bronchitis., causes=Main sources are fuel burning processes in industry, transportation and indoor heating., main=At the moment, fine particulate matter (PM2.5) is the main pollutant in the air:}
country_name	USA
random_recommendations	{inside=The air quality is still good - we'll keep you updated if things get worse, children=No reason to panic, but pay attention to changes in air quality and any signals of breathing problems in your children, sport=You can go on a run - just keep your nose open for any changes!, health=Exposure to air hazards is dangerous for people with health sensitivities, so it is important to monitor air quality at this time, outside=It's still OK out there. Just stay alert for notifications about change in air quality}
*/

//
// Run on all the locations you wish to save for analysis
//
function collectLocations() {
  fetchData("http://api-beta.breezometer.com/baqi/?location=new+york&key=9de9e08086af4c6ea6d2ac60b3d38acb", "New York");
  fetchData("http://api-beta.breezometer.com/baqi/?location=new+york&key=9de9e08086af4c6ea6d2ac60b3d38acb", "San Francisco");
  fetchData("http://api-beta.breezometer.com/baqi/?location=menlo+park,+ca,+united+states&key=9de9e08086af4c6ea6d2ac60b3d38acb", "Palo Alto");
}

//
// Fetch a json object and push the values to a certain sheet that will collect them.
// This will allow us in the future to create charts from the data per location.
//
function fetchData(url, location) {
  // Fetch the url with the data
  var result = UrlFetchApp.fetch(url);
  var o      = JSON.parse(result.getContentText());

  // Locate the sheet the is dedicate for this location
  var doc   =  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(location);
  var index = doc.getLastRow() ;
  var cell  = doc.getRange('a1');
  cell.offset(index, 0).setValue(location);
  cell.offset(index, 1).setValue(new Date());
  for (var i in o) {
    var row = o[i];
    if (i.indexOf("breezometer_description") > -1) {
      cell.offset(index, 2).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("breezometer_aqi") > -1) {
      cell.offset(index, 3).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("dominant_pollutant_canonical_name") > -1) {
      cell.offset(index, 4).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("breezometer_color") > -1) {
      cell.offset(index, 5).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("dominant_pollutant_description") > -1) {
      cell.offset(index, 6).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("dominant_pollutant_text") > -1) {
      cell.offset(index, 7).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
    else if (i.indexOf("random_recommendations") > -1) {
      cell.offset(index, 8).setValue(row);
      Logger.log("key: " + i + " val: "+ row);
    }
  }
  Logger.log("done with: "+ url);
}

