function doGet() {
  var app = UiApp.createApplication();
  
  //Create a penel which will hold all the elements
  var panel = app.createVerticalPanel();
  
  //CreateLabels as indicator for dates
  var dateLabel1 = app.createLabel('Date1');
  var dateLabel2 = app.createLabel('Date2');
  
  //Create dateboxes for dates  
  var dateBox1 = app.createDateBox().setId('date1');
  var dateBox2 = app.createDateBox().setId('date2');
  
  //Create a button
  var button = app.createButton('Submit');
  
  //Create a label which will initially be hidden, it will hold the date 
  //values which will be visible after submit
  var dateInfo1 = app.createLabel().setId('dateInfo1').setVisible(false);
  var dateInfo2 = app.createLabel().setId('dateInfo2').setVisible(false);
  
  //createHandler which will show the selected dates.
  var handler = app.createServerClickHandler('showDates');
  handler.addCallbackElement(panel);
  
  //Add this handler to the button
  button.addClickHandler(handler);
  
  //Add all the UI elements to the panel
  panel.add(dateLabel1)
    .add(dateBox1)
    .add(dateLabel2)
    .add(dateBox2)
    .add(button)
    .add(dateInfo1)
    .add(dateInfo2);
  
  //Add the panel to the application
  app.add(panel);
  return app; 
}


//this function will show the dates
function showDates(e){
  
  //get the active aplication
  var app = UiApp.getActiveApplication();
  
  //set the dateInfo labels visible, also make the text as selected dates
  app.getElementById('dateInfo1').setVisible(true).setText(e.parameter.date1.toString());
  app.getElementById('dateInfo2').setVisible(true).setText(e.parameter.date2.toString());
  
  return app;
}