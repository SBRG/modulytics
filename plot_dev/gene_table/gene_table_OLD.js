//MyCsvToTable.js 
//Kevin Rychel 4/13/2020
//Parses a csv file with ignored quotes, converts to HTML

//csvLineParse: handles a single line
function csvLineParse(line) {
  var arr = line.split(",");
  var i, j, k, currAns, inQuote;
  var ans = [];
  
  j = 0;
  currAns = "";
  inQuote = false;  
  for (i in arr) {
    
    if (inQuote) {
      currAns += ", " + arr[i];
      if (arr[i].charAt(arr[i].length-1) == '"') {
        currAns = currAns.slice(1, currAns.length-1);
        ans[j] = currAns;
        currAns = "";
        j++;
        inQuote = false;
      }
    } else {
      currAns += arr[i];
      if (arr[i].charAt(0) == '"') {
        inQuote = true;
      } else {
        ans[j] = currAns;
        currAns = "";
        j++;
      }
    }
  }
  return ans;
}


function parseCSV(csv, element) {

  var table = ""

  // start making the table 
  table += "<thead>"
  
  // parse data
  var lines = csv.split("\n");
  for (l in lines) {
    table += "<tr>"
    
    var delim;
    if (l == 0) {
      delim = "th";
    } else {
      delim = "td";
    }
  
    elts = csvLineParse(lines[l]);
    for (e in elts) {
      // the gene weight has a lot of decimal places
      if (e == 2) {
        var cut;
        if (elts[e].charAt(0) == '-') {cut = 7;}
        else {cut = 6;}
        elts[e] = elts[e].slice(0,cut);
      }
      
      table += "<"+delim+">"+ elts[e] + "</"+delim+">";
    }
    table += "</tr>";
    if (l == 0) {
      table += "</thead> <tbody>";
    }
  }
  table += "</tbody>";
  document.getElementById(element).innerHTML += table;
}

// AJAX to get the CSV
function getCSVtext(csvFile, element) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      parseCSV(this.responseText, element);
    } 
  }

  xhttp.open("GET", csvFile, true);
  xhttp.send();
}