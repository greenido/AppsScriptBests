//
// return the current data in this format: mm/dd/yyyy 
//
function getDateOfToday() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd;
  } 
  if(mm<10){
    mm='0'+mm;
  } 
  var todayStr = mm+'/'+dd+'/'+yyyy;
  return todayStr;
}


//
// 0 = sunday , 1 = monday....  6=SAT
//
function getDayOfWeek() {
  var d=new Date();
  Logger.log(d.getDay());
  return d.getDay();
}

//
// Return true if the current day is SUN or SAT
// As we are not working on weekends (=no new data).
//
function isWeekend() {
  var curDay = getDayOfWeek();
  if ( curDay === 0 || curDay === 6) {
    return true;
  }
  else {
    return false;
  }
}