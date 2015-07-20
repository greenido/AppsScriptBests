<?php

// Const
$gitPathPre = "https://github.com/greenido/AppsScriptBests/tree/master/public_html/AppsScript";
$fullList = array();
$mdFileName = "ListOfScripts.md";

/**
 * 
 * @param type $dir
 * @return type
 */
function dirToArray($dir) { 
   $result = array(); 
   $cdir = scandir($dir); 
   foreach ($cdir as $key => $value) { 
      if (!in_array($value, array("." , ".." , ".DS_Store"))) { 
         if (is_dir($dir . DIRECTORY_SEPARATOR . $value)) { 
            $result[$value] = dirToArray($dir . DIRECTORY_SEPARATOR . $value); 
         } 
         else { 
            $result[] = $value; 
         } 
      } 
   }    
   return $result; 
} 

//
// Start the party
//
$path   = 'AppsScript';
//$files = dirToArray($path);
exec("find . -follow", $files);
print_r($files);

foreach ($files as $name) {
  if (strpos($name, "AppsScript/" ) > 0) {
    if ( !strpos($name, ".DS_Store") ) {
      $name = str_replace("./AppsScript/", "", $name);
      $fName = "* [$name](" . $gitPathPre . "/" . $name . ")\n";
      array_push($fullList, $fName );
      file_put_contents($mdFileName, $fName, FILE_APPEND);
    }
  }
}
echo "\n\n=== list of files: \n";
print_r($fullList);

