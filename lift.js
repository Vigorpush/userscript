// ==UserScript==
// @name         UofS TimeTable Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A bit of Javascript for enhancing the LAF of the timetable page on the usask website
// @author       Zang JiaWei, Nobleman Chukwu, Bengin Lee
// @match        https://pawnss.usask.ca/ban/*
// @grant        none
// ==/UserScript==

var maincolor = "#2c8fe4";

(function() {
    'use strict';

    var lnk = document.createElement('link');
    lnk.rel = "stylesheet";
    lnk.href = "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css";
    document.head.appendChild(lnk);
    document.body.style.background = maincolor;
    //document.getElementByTag("A:link").style.color ="magenta";//change the font color in calender
    document.querySelector(".pagebodydiv > div.infotextdiv").style.display = "none";
    var search = document.querySelector('.pagebodydiv > form:nth-child(2) > table:nth-child(1)');
    if (search) {
        console.log("Found the search thingy");
    }
    search.style.display = 'none';

    var tableStyle = 'table table-striped table-bordered table-condensed table-responsive';
    var timeTable = document.querySelector('.datadisplaytable');
    timeTable.className = tableStyle;
})();
