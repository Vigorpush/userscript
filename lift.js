// ==UserScript==
// @name		UofS TimeTable Enhancer
// @namespace		http://tampermonkey.net/
// @version		0.1
// @description		A bit of Javascript for enhancing the LAF of the timetable page on the usask website
// @author		Zang JiaWei, Nobleman Chukwu, Bengin Lee, Mark Nguyen
// @match		https://pawnss.usask.ca/ban/*
// @require		https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require		https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require     	https://gitlab.com/481-HCI/Scripts/raw/master/html2canvas.js
// @require     	https://gitlab.com/481-HCI/Scripts/raw/master/jquery.plugin.html2canvas.js
// @require		http://www.eyecon.ro/datepicker/js/datepicker.js
// @require 		http://t4t5.github.io/sweetalert/dist/sweetalert-dev.js
// @resource		sweetAlert http://t4t5.github.io/sweetalert/dist/sweetalert.css
// @resource		sharemenu https://gitlab.com/481-HCI/Scripts/raw/master/Sharemenu.css
// @resource		bootStrap https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @grant		GM_getResourceText
// @grant		GM_addStyle
// ==/UserScript==


var UofSTimeTable = (function () {

    /**
     * A cell object
     * Since the table cells are staggered, we need a way of
     * knowing where each cell begins and ends
     * @constructor
     */
    function Cell() {
        this.ocb = 0;
        this.height = 0;
    }

    /**
     * adding style sheets into head
     */
    function addStyleSheet(resName) {
        var style = GM_getResourceText(resName);
        GM_addStyle(style);
    }

    function current_page_date() {
        var regular_date = /(\w+ \d+.*)/;
        var match = regular_date.exec($(".fieldlargetext").text());
        UofSTimeTable.CURRENT_PAGE_MONDAY_DATE = new Date(match[1]);
    }



   /**
    * This enlarges the search top rows of the timetable table
    * @constructor
    */
    return {

        CURRENT_PAGE_MONDAY_DATE: new Date(),
      
        TIMETABLE: $('table.datadisplaytable'),

        /**
         * Creating the share button
         * Add share functionality works
         */
        CreateButton: function () {
            var input = document.createElement("div");
            input.id = "Share_button";
            input.onclick = ShareAction;
            document.body.appendChild(input);

            $("#Share_button").css({
                'font-size': '1em',
                'position': 'fixed',
                'bottom': '40px',
                'right': '40px',
                'border-radius': '50%',
                'overflow': 'hidden',
                'width': '60px',
                'height': '60px',
                'border': '5px solid #39a3b1',
                'background': '#39a3b1',
                'box-shadow': '0px 0px 20px 0px #000'
            });

        },//End of Create button

        /**
         * Function to highlight all the cells that correspond to the current day
         * @param params json object containing parameters for the state attributes of each cell
         */
        HighlightDays: function (params) {
            var cell_color = params.cell_color || '#ffc61a';
            var font_color = params.font_color || 'white';
            var font_size = params.font_size || '1em';
            var days = params.days || [true];

            var today = new Date();
            var temp = new Date(this.CURRENT_PAGE_MONDAY_DATE);
            temp.setDate(temp.getDate() + today.getDay() - 1);


            this.TIMETABLE.addClass("table table-striped table-bordered table-responsive table-condensed");

            if (today.getDate() != temp.getDate() || today.getMonth() != temp.getMonth()) {
                return;
            }

            var d = new Date().getDay() - 1;

            var rowInfo = [new Cell(), new Cell(), new Cell(),
                new Cell(), new Cell(), new Cell(), new Cell()
            ];

            this.TIMETABLE.find('tr').slice(1).each(function (_) {
                var currRow = $(this);
                $.each(rowInfo, function (key, cell) {
                    // height of zero means that the original row ends here and a new row starts
                    if (cell.height === 0) {
                        var currCell = currRow.find('td:nth-of-type(' + (key - cell.ocb + 1) + ')');
                        var span = $(currCell).attr('rowspan');

                        cell.height = span ? parseInt(span) : 1;

                        if (days[0] && key == d) {
                            $(currCell).css({
                                'background-color': cell_color
                            }).find('a').css({
                                'color': font_color,
                                'font-size': font_size
                            });
                        }
                    }
                    if (key > 0) {
                        cell.ocb = rowInfo[key - 1].ocb + (rowInfo[key - 1].height > 0);
                    }
                    cell.height--;
                });
            });
        },//End of HighlightDays

        init: function () {
            $(".ddlabel A").css({'color': '#39a3b1', 'font-size': '100%'});
            addStyleSheet('bootStrap');
            addStyleSheet('sweetAlert');
            addStyleSheet('sharemenu');
            EnlargeTopRows();
            current_page_date();
            return this;
        }//End of init function
    };//End of return
})();

$(document).ready(function () {

  UofSTimeTable.init().HighlightDays({
        cell_color: "#2fb673",
        font_color: "white",
        font_size: "1em"
    });

    UofSTimeTable.CreateButton(); //need naming standard for vars
    
    replace_title();
    rid_number();
    makeTimeLabel();
    invokeTime();
	EnlargeTopRows(); //always after ridnumber
  	addhelpertext();
  	resetnextweekposition();
  	addednextterm();
  	addedprevterm();

    removeSpaceOnTop();
  	NextTermListener();
  	PrevTermListener();
  
  


});

//////////////////////////////////////////
//					//
//		Function Callees	//
//					//
//////////////////////////////////////////


/**
* This function will add click listener to the next term button
*/
function NextTermListener(){
  $("#NexttermButton").on('click', function(){
      SwitchNextTerm();
  });
}

/**
* This function will add click listener to the prev term button
*/
function PrevTermListener(){
  $("#PrevtermButton").on('click', function(){
    SwitchPrevTerm();
  });
}

/**
* This function will remove the empty space on the top
*/
function removeSpaceOnTop(){
  $(".pageheaderdiv1 > h1").remove();
}

/**
* Change the top two rows style in this table
**/
function EnlargeTopRows() {
        var timeTable = UofSTimeTable.TIMETABLE;

        timeTable.find("tr:nth-child(1)").children().slice(1).css({
            "font-size": "1.2em",
            "text-align": "center"
        });

	timeTable.find("tr:nth-child(2)").children().slice(1).css({
            "font-size": "0.8em",
            "text-align": "center"
        });
}




var maxYear = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000 + 1;//globel var for next year value
function SwitchNextTerm() {
  
  var CurrentYear =  UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000 + 1;
  if(CurrentYear > maxYear){
    //alert("reached to max");
    return;
  }
  
  
  var month = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getMonth() + 1;
  if((month>=1) && (month<5)){
    var currentsummerT1 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=05/30/"+currentsummerT1+"";
    //alert("move to summer term1!");
    return;
  }
  
  if((month>=5)&&(month<7)){
    var currentsummerT2 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=07/30/"+currentsummerT2+"";
    //alert("move to summer term2!");
    return;
  }
  
  if((month>=7)&&(month<9)){
    var currentregularT1 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=09/30/"+currentregularT1+"";
    //alert("move to regular term1!");
    return;
  }
  
  
  document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=01/30/"+CurrentYear+""; 
}

function SwitchPrevTerm() {
  var CurrentYear =  UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000 - 1;
  var month = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getMonth()+1;
  if((month >= 9) && (month<=12)){
      //alert("move to summer term!");
  } 
  
   
  var month = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getMonth() + 1;
  if((month>=1) && (month<5)){
    var currentsummerT1 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000 -1;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=09/30/"+currentsummerT1+"";
    //alert("move to regular term1!");
    return;
  }
  
  if((month>=5)&&(month<7)){
    var currentsummerT2 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=01/30/"+currentsummerT2+"";
    //alert("move to regular term2!");
    return;
  }
  
  if((month>=7)&&(month<9)){
    var currentregularT1 = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=05/30/"+currentregularT1+"";
    //alert("move to summar term1!");
    return;
  }

  document.location.href = "https://pawnss.usask.ca/ban/bwskfshd.P_CrseSchd?start_date_in=07/30/"+CurrentYear +""; 
}



/**
 * Replace the title with "Student schedule for 2016-2017"
 * */
function replace_title() {
    var CurrentYear =  UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getYear() - 100 + 2000;
    var checkyear = CurrentYear;
    var month = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE.getMonth()+1;
    var term ;
    if((month >= 9) && (month<=12)){
      term = "Term 1";
    } 
    if ((month>=1) && (month<5)){
      term =  "Term 2";
    }
    if ((month >=5) && (month< 7)){
      term = "Summer Term 1";
    } 
    if ((month >=7) && (month< 9)){
      term = "Summer Term 2";
    } 
  
    if((month>=1) && (month<5) ){
      checkyear = CurrentYear - 1;
    }
    document.querySelector(".pagetitlediv").innerHTML = "Student Schedule for "+ checkyear +" - "+(checkyear+1) +" " + term +"<br><br>";
    document.querySelector(".pagetitlediv").style.color = '#39a3b1';
    document.querySelector(".pagetitlediv").style.fontSize = 'x-large';
    document.querySelector(".pagebodydiv > div.infotextdiv").style.display = 'none';//Removes the useless information on the page that no one reads.
}

/**
 * Get rid of the hideous number that shows the number of weeks you have been attending the UofS
 * */
function rid_number() {

    var monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    
    
    $("body > div.pagebodydiv > table:nth-child(3) > tbody > tr > td:nth-child(3)").remove();//Remove the useless information detailing the total number of weeks a student has been attending the U of S.

    
    var weekDays = $("body > div.pagebodydiv > table.datadisplaytable.table.table-striped.table-bordered.table-responsive.table-condensed > tbody > tr:nth-child(1)");
    var monthDate = weekDays.clone();
    weekDays.after(monthDate);// clone a new row, and append after the first row

    var today = UofSTimeTable.CURRENT_PAGE_MONDAY_DATE;
    $(monthDate).children().slice(1).each(function (index) { // put the month and date into second row
        var month = monthNames[today.getMonth()];
        var html_String = month + "&nbsp;" + today.getDate();
        $(this).html("&nbsp;&nbsp;&nbsp;" + html_String);
        today.setDate(today.getDate() + 1);
    });

    
    if ($.trim($(monthDate).text()) == "No courses with assigned times this week.") { //compare the information shows that No courses .., then remove the additional row
        $(monthDate).remove();
    }
}



/**
 * Function Share function Caller
 */
function ShareAction() {
    //Edit some code into here, for sharing
    //
    //
    //
 /*   
  <link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet' type='text/css'>
	<link href='http://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>
<div id="wrapper">
	<h1>CSS3 Menu</h1>
	<ul class="nav">
		<li class="hm">
			<img class="icon" src="https://cdn0.iconfinder.com/data/icons/typicons-2/24/home-24.png" alt="">
			<span>Home</span>
		</li>
		<li class="fb">
			<img class="icon" src="https://cdn0.iconfinder.com/data/icons/typicons-2/24/social-facebook-24.png" alt="">
			<span>Facebook</span>
		</li>
		<li class="gp">
			<img class="icon" src="https://cdn3.iconfinder.com/data/icons/picons-social/57/40-google-plus-24.png" alt="">
			<span>Google-plus</span>
		</li>
		<li class="tw">
			<img class="icon" src="https://cdn0.iconfinder.com/data/icons/typicons-2/24/social-twitter-24.png" alt="">
			<span>Twitter</span>
		</li>
		<li class="cl">
			<img class="icon" src="https://cdn0.iconfinder.com/data/icons/typicons-2/24/phone-24.png" alt="">
			<span>Call</span>
		</li>
	</ul>
</div>
  */          
    var content = "<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet' type='text/css'>"
                      + "<link href='http://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>"
                      + "<div id='wrapper' class= 'centered' style= 'width:768px;!important; height: 340px;!important; left: 23%;'>"
                      	+ "<h1>Share Menu</h1>"
                      	+ "<ul class='nav'>"
                      		+ "<li class='hm'>"
                      			+ "<img class='icon' src='https://cdn0.iconfinder.com/data/icons/typicons-2/24/home-24.png' alt=''>"
                      			+"<span>Home</span>"
                      		+ "</li>"
                      		+ "<li class='fb'>"
                      			+ "<img class='icon' src='https://cdn0.iconfinder.com/data/icons/typicons-2/24/social-facebook-24.png' alt=''>"
                      			+ "<span>Facebook</span>"
                      		+ "</li>"
                      		+ "<li class='gp'>"
										+ "<img class='icon' src='https://cdn3.iconfinder.com/data/icons/picons-social/57/40-google-plus-24.png' alt=''>"
										+ "<span>Google-plus</span>"
									+ "</li>"
									+ "<li class='tw'>"
										+ "<img class='icon' src='https://cdn0.iconfinder.com/data/icons/typicons-2/24/social-twitter-24.png' alt=''>"
										+ "<span>Twitter</span>"
									+ "</li>"
									+ "<li class='cl'>"
										+ "<img class='icon'' src='https://cdn0.iconfinder.com/data/icons/typicons-2/24/phone-24.png' alt=''>"
										+ "<span>Call</span>"
									+ "</li>"
                      + "</ul>"
                      + "</div>";
    //alert(content);
    $("body").append(content);
    Comfirmation();//remove this line
}
//End of ShareAction




/**
 * Show comfirmation information
 */
function Comfirmation(){
    swal({
        title: "Error!",
        text: "Here's my error message!",
        type: "error",
        confirmButtonText: "Cool"
    });
}
//End of Comfirmation 



/**
* This function will add helper information about the search format
*/
function addhelpertext(){
      var targetposition= $(".fieldlabeltext");
      var designation = $("body > div.pagebodydiv > form > table > tbody > tr > td ").append("<div ><p class ='helper'>Example for Feb 06, 2016 : 02/06/2016</p></div>");
      $(".helper").css({
	  "margin-top":"0.5%",
          "font-size": "1em",
          "color": "#545454"
      });
}


/**
* This function will reset the position of next week button to the right
*/
function resetnextweekposition(){
 var nextweek =  $(".rightaligntext");
  	$(".rightaligntext").css({
			"margin-right":"-61.5%"
      });
}
/**
 * This function will added next term button
 */
function addednextterm(){
    $("body > div.pagebodydiv > table:nth-child(3) > tbody > tr > td:nth-child(5) > p").append("<div id='NexttermButton'  style = 'display:inline;'><a>Next term</a></div>");  
  	$("#NexttermButton").css({
       	  "margin-left":"0.5%",
      });
}

/**
 * This function will added prev term button
 */
function addedprevterm(){
	$("body > div.pagebodydiv > table:nth-child(3) > tbody > tr > td:nth-child(1)").prepend("<div id='PrevtermButton'  style = 'display:inline;'><a>Previous term</a></div>");
    	$("#PrevtermButton").css({
       	  "margin-right":"0.5%",
      });
}


/**
* Shows realtime 
*/
var time = document.createElement('label'); //Create a time label
function makeTimeLabel() {
    time.innerHTML = new Date();
    document.getElementsByTagName('body')[0].appendChild(time);
  	 $("body > label").css({
       	  "position": "fixed",
    		"bottom": "0",
    		"left": "0",
      		"border": "2px solid #73AD21",
      "background-color":"white"
      });
}

function updateTime() {
    var date = new Date();
    var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    var am_pm = date.getHours() >= 12 ? "PM" : "AM";
    hours = hours < 10 ? "0" + hours : hours;
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    //TimeString = hours + ":" + minutes + ":" + seconds + " " + am_pm;
    //time.innerHTML = TimeString;
    time.innerHTML = new Date();    
}
function invokeTime() {
    window.setInterval(updateTime, 1000); // update the time every second
}
//End of current time clock