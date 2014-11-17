/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function doGet() {
  var html = UrlFetchApp.fetch('http://en.wikipedia.org/wiki/Document_Object_Model').getContentText();
  var doc = XmlService.parse(html);
  var html = doc.getRootElement();
  var menu = getElementsByClassName(html, 'vertical-navbox nowraplinks')[0];
  var output = XmlService.getRawFormat().format(menu);
  return HtmlService.createHtmlOutput(output);
}

//We fetch the HTML through UrlFetch
//We use the XMLService to parse this HTML
//Then we can use a specific function to grab the element we want in the DOM tree (like getElementsByClassName)
//And we convert back this element to HTML 
//Or we could get all the links / anchors available in this menu and display them
function doGet() {
  var html = UrlFetchApp.fetch('http://en.wikipedia.org/wiki/Document_Object_Model').getContentText();
  var doc = XmlService.parse(html);
  var html = doc.getRootElement();
  var menu = getElementsByClassName(html, 'vertical-navbox nowraplinks')[0];
  var output = '';
  var linksInMenu = getElementsByTagName(menu, 'a');
  for (i in linksInMenu)
    output += XmlService.getRawFormat().format(linksInMenu[i]) + '<br>';
  return HtmlService.createHtmlOutput(output);
}

//Available functions
//Contents
//1 getElementById
//2 getElementsByClassName
//3 getElementsByTagName

//getElementById
function getElementById(element, idToFind) {
  var descendants = element.getDescendants();
  for (i in descendants) {
    var elt = descendants[i].asElement();
    if (elt != null) {
      var id = elt.getAttribute('id');
      if (id != null && id.getValue() == idToFind)
        return elt;
    }
  }
}

//getElementsByClassName
function getElementsByClassName(element, classToFind) {
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);
  for (i in descendants) {
    var elt = descendants[i].asElement();
    if (elt !== null) {
      var classes = elt.getAttribute('class');
      if (classes !== null) {
        classes = classes.getValue();
        if (classes === classToFind)
          data.push(elt);
        else {
          classes = classes.split(' ');
          for (j in classes) {
            if (classes[j] === classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
}
//getElementsByTagName
function getElementsByTagName(element, tagName) {
  var data = [];
  var descendants = element.getDescendants();
  for (i in descendants) {
    var elt = descendants[i].asElement();
    if (elt !== null && elt.getName() === tagName)
      data.push(elt);
  }
  return data;
}

