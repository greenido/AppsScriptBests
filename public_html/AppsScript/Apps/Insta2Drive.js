/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function fetchInstagram() {

  //Choose your favourite tag
  var TAG_NAME = 'snowboarding';

  //Your client Id which you got by registering your client for Instagram API
  var CLIENT_ID = 'TODO';

  //Endpoint url to fetch photos information,
  //note that we have used TAG_NAME and CLIENT_ID with the endpoint URL
  var url = 'https://api.instagram.com/v1/tags/' + TAG_NAME + '/media/recent?client_id=' + CLIENT_ID;

  //when there is a url to fetch photo details, fetch the details from API
  while (url) {
    //let us fetch the details from API. This will give you the details of photos and URL
    var response = UrlFetchApp.fetch(url).getContentText();

    //pase the JSON string data to JSON
    var responseObj = JSON.parse(response);

    //get photo data
    var photoData = responseObj.data;

    //iterate over this data
    for (var i in photoData) {
      var imageUrl = photoData[i].images.standard_resolution.url;
      fetchImageToDrive_(imageUrl);
    }

    //Get the url of the next page
    url = responseObj.pagination.next_url;
  }
}

function fetchImageToDrive_(imageUrl) {
  //Fetch image blob
  var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  //Create image file in drive
  var image = DriveApp.createFile(imageBlob);
  //return the URL of the newly created image in drive
  return image.getUrl();
}