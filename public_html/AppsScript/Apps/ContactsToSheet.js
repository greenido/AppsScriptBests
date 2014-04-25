function doGet() {
  var app = UiApp.createApplication();
  var panel= app.createVerticalPanel();
  
  //get the contacts
  var contacts = ContactsApp.getContacts();
  
  //Create grid to hold the contacts data
  var grid = app.createGrid(contacts.length+1,4)
      .setStyleAttribute('border', '1px solid black')
      .setBorderWidth(1);
  
  //Create the header row
  grid.setWidget(0, 0, app.createLabel('Name'))
    .setWidget(0, 1, app.createLabel('Email'))
    .setWidget(0, 2, app.createLabel('Ph.No.'))
    .setWidget(0, 3, app.createLabel('Address'));
  
  //Write all the contacts in grid/table
  for (var i=0; i<contacts.length; i++){
    //Get the full name, If it is null, display 'Not available'
      if(contacts[i].getFullName()!='')grid.setWidget(i+1, 0, app.createLabel(contacts[i].getFullName()));
    else
      grid.setWidget(i+1, 0, app.createLabel('Not Available').setStyleAttribute('color', 'red'));
    
    //Get the First Email address, If it is undefined, display 'Not Available'
    try{
      grid.setWidget(i+1, 1, app.createLabel(contacts[i].getEmails()[0].getAddress()));
    }
    catch(e){
      grid.setWidget(i+1, 1, app.createLabel('Not Available').setStyleAttribute('color', 'red'));
    }
    
    //Get the first phone number, If it is undefined, display 'Not Available'
    try{
      grid.setWidget(i+1, 2, app.createLabel(contacts[i].getPhones()[0].getPhoneNumber())); 
    }
    catch(e){
      grid.setWidget(i+1, 2, app.createLabel('Not Available').setStyleAttribute('color', 'red'));
    }
    
    //Get the first address, If it is undefined, display 'Not Available'
    try{
      grid.setWidget(i+1, 3, app.createLabel(contacts[i].getAddresses()[0].getAddress())); 
    }
    catch(e){
      grid.setWidget(i+1, 3, app.createLabel('Not Available').setStyleAttribute('color', 'red'));
    }
  }
  
  //add the grid/table to the panel
  panel.add(grid);
  
  //add the panel to the application
  app.add(panel);
  return app;
}