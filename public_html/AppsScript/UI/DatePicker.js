function showDatesDialog() {
  var app = UiApp.createApplication();  
  var panel = app.createVerticalPanel();
  
  var dateLabel1 = app.createLabel('Start Date');
  var dateLabel2 = app.createLabel('End Date');
  
  var dateBox1 = app.createDateBox().setId('date1');
  var dateBox2 = app.createDateBox().setId('date2');
  
  var button = app.createButton('Submit');
  
  var dateInfo1 = app.createLabel().setId('dateInfo1').setVisible(false);
  var dateInfo2 = app.createLabel().setId('dateInfo2').setVisible(false);
  
  var handler = app.createServerClickHandler('showDates');
  handler.addCallbackElement(panel);
  
  button.addClickHandler(handler);
  
  // Put all the UI elements on our main panel (like in the good old days of GWT)
  panel.add(dateLabel1)
    .add(dateBox1)
    .add(dateLabel2)
    .add(dateBox2)
    .add(button)
    .add(dateInfo1)
    .add(dateInfo2);
  
  app.add(panel);
 
  var ss = SpreadsheetApp.getActive();
  // show the UI
  ss.show(app);
}

//
// Print the dates on the UI
//
function showDates(e){  
  var app = UiApp.getActiveApplication();
  //  Get the elements by Ids and print the dates
  app.getElementById('dateInfo1').setVisible(true).setText(e.parameter.date1.toString());
  app.getElementById('dateInfo2').setVisible(true).setText(e.parameter.date2.toString());

}