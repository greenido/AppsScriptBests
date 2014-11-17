
//
// Format a number with -+,.
//
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = (d === undefined) ? "." : d, 
    t = (t === undefined) ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
        (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

//
// clean prices from things like: $ or ,
//
function cleanSymbolFromDigits(sym) {
 var re = /^[A-Za-z]+$/;
 var newSym = sym;
 if (!re.test(sym)) {
   newSym = sym.substring(0, sym.length-1);
 }
 return newSym; 
}

//
// Do we have a valid number
//
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//
// Check if we have a float 
//
function isFloat(n) {
    return n === +n && n !== (n|0);
}
