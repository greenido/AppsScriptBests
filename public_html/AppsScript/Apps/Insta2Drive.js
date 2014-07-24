
//
// Search, Fetch and save images from Instagram by tags.
//
function fetchInstagram() {
  // Feel free to change this one
  var TAG_NAME = 'snowboarding';

  // You need to replace todo with your client-id
  // Get it at: http://instagram.com/developer/clients/manage/
  var CLIENT_ID = 'todo';
  var url = 'https://api.instagram.com/v1/tags/' + TAG_NAME + '/media/recent?client_id=' + CLIENT_ID;

  // fetch the top 10 results
  while (i < 10) {
    //let us fetch the details from API. This will give you the details of photos and URL
    var response = UrlFetchApp.fetch(url).getContentText();
    var responseObj = JSON.parse(response);
    var photoData = responseObj.data;

    //iterate over this data
    for (var i in photoData) {
      var imageUrl = photoData[i].images.standard_resolution.url;
      Logger.log("image url: "+imageUrl);
      //Todo: open this comment if you wish to save the file: fetchImageToDrive_(imageUrl);
    }

    //Get the url of the next page
    url = responseObj.pagination.next_url;
  }
}

//
// fetch and save the file into drive
//
function fetchImageToDrive_(imageUrl) {
  var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  // Create image file in drive
  var image = DriveApp.createFile(imageBlob);
  // return the URL of the newly created image in drive so we could log it.
  return image.getUrl();
}