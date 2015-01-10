<?php

// Const
$gitPathPre = "https://github.com/greenido/AppsScriptBests/tree/master/public_html/AppsScript";
$fullList = array();
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
$files = dirToArray($path);
print_r($files);

// TODO: build from the files a list that we can use in the README.md

