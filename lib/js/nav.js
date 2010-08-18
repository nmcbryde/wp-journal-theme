/*
 * Interactive Chronological Post Navigation Bar
 *
 * Copyright (c) 2008 Nigel McBryde (nigel.mcbryde.com.au)
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 */

$(document).ready(function(){
	/*
	 * Creates a new Navigation Class and sets up required behaviours
	 * Runs on page load
	 */
	
	var nav = new Navigation();
	
	$(".navigation .previous").click(function() {
		if(nav.getYear(nav.selectedYear -1) != null){
			nav.setSelectedYear(nav.selectedYear-1);
		}
	});
	
	$(".navigation .next").click(function() {	
		if(nav.getYear(nav.selectedYear +1) != null){
			nav.setSelectedYear(nav.selectedYear+1);
		}
	});
	
});


/*
 * Class Navigation
 *
 * The basic Navigational object is an array of Years which is populated with an array of Months. Each month will contain Posts.
 * When the Navigation object is instanced an XML representation of the posts in the database is retrieved and slotted into the
 * appropriate year and month. The whole structure is used to then draw and redraw the Navigation Bar on the webpage.
 *
 */

function Navigation() {
	
	// functions
	
	this.draw = draw;						// draws the selected year to the screen
	this.createYears = createYears;			// creates the array of years
	this.getYearArray = getYearArray;		// returns the year array
	this.getSelectedYear = getSelectedYear;	// returns the year currently displayed onscreen
	this.setSelectedYear = setSelectedYear;	// sets the year currently displayed onscreen
	this.getYear = getYear;					// returns a year object fromo with the array of years
	
    
	// private variables
	
	var _this = this;						// for refering to the Navigation object from within JQuery functions
	var selectedYear;
	var pageYear;
	var pageMonth;
	var pageDay;
	var years = createYears();
	
	/*
	 * Function getYearArray
	 * Returns the array of years
	 */
	function getYearArray() {
		return this.years;
	}

	/*
	 * Function getSelectedYear
	 * Returns the year object which belongs to the year currently being displayed
	 */
	function getSelectedYear () {
		return years[this.selectedYear];
	}
    
	/*
	 * Function setSelectedYear
	 * Sets the selected Year
	 * Changes the selected Month accordingly
	 * Requires a valid year
	 */
	function setSelectedYear(year) {
		
		// determine wether we have moved forwards in time or back, and then set the selectedMonth accordingly
		if(_this.selectedYear < year) {
			if (years[year].getPostCount() < 1) {
				years[year].selectedMonth = 0;
			} else {
				years[year].selectedMonth = years[year].getFirstMonth();	
			}
		} else {
			if (years[year].getPostCount() < 1) {
				years[year].selectedMonth = 11;
			} else {
				years[year].selectedMonth = years[year].getLastMonth();	
			}
		}
		// set the year and then refresh the html onscreen
		_this.selectedYear = year;
		draw();
	}
    
	/*
	 * Function getYear
	 * Returns the selected year from the year array
	 * Requires valid array Index
	 */ 
	function getYear( yearIndex ) {
		return years[yearIndex];
	}
	
	/*
	 * Function getYear
	 * Creates an array of years from an XML response
	 */ 
	function createYears() {
		
		var yearArray = new Array(); // temporary holder for the array of years
		var counter = 0;

		$.ajax({
                type: "GET",
                url: '/wp-content/themes/journal-theme/lib/php/postHandler.php',
                dataType: (jQuery.browser.msie) ? 'text' : 'xml',
                success: function(xml){
                        var data;
                        if ( typeof xml == 'string') {
                                data = new ActiveXObject( 'Microsoft.XMLDOM');
                                data.async = false;
                                data.loadXML( xml);
                        } else {
                                data = xml;
                        }
                        $(data).find("year").each(function() {
                                
                                // for each year element found in the XML create a Year object in the yearArray with the XML contained
                                var yearNumber = $("yearnumber", this).text();
                                
                                yearArray[counter++] = new Year(yearNumber, this);
                         });
                        
                        var selected = location.search; // for determinig wether we are in a blog post or not
                        
                        /* to solve the problem where there are no posts in a particular year we need to find
                         * the difference between the current year and the last year added to the array
                         * and then add as many years to the yearArray
                         */ 
                        var thisYear = parseInt(Date.today().toString('yyyy'));
                        var baseYear = yearArray[counter-1].getYear()
                        var difference = thisYear - baseYear;
                        
                        if (difference > 0){
                            for(var i = 0; i<difference; i++) {
                                yearArray[counter+i] = new Year(parseInt(baseYear)+parseInt(i+1), this);
                            }
                            _this.selectedYear = counter;
                        } else {
                            _this.selectedYear = counter-1;
                        }
                    
                                // otherwise the last year created is automatically selected
                            // if a post is selected the appropriate year must be selected
                        if (selected != "" && selected.substring(0, 3) == "?p=") {
                                var pageYear = Date.parse($("h2.header-sub").text()).toString('yyyy');
                                for(var i = 0; i < counter; i++) {
                                        if (yearArray[i].year == pageYear){
                                                _this.selectedYear = i;
                                                break;
                                        }
                                }
                        }
                    
                         draw();

                       
                }
        });
			
		return yearArray;
	}

	/*
	 * Function draw
	 * Creates the navigation bar from the yearArray
	 * Outputs to screen
	 */ 
	function draw() {
	//figure out how to draw the nav bar
		$(document).ready(function(){
			var selected = location.search; // for determinig wether we are in a blog post or not
			if (selected != "" && selected.substring(0, 3) == "?p=" ) {			// if the page is a post
				// render it accordingly
				_this.pageMonth = Date.parse($("h2.header-sub").text()).toString('M')-1;
				_this.pageDay = Date.parse($("h2.header-sub").text()).toString('d')-1;
				_this.pageYear = Date.parse($("h2.header-sub").text()).toString('yyyy');
			 
				if (_this.pageYear == _this.getSelectedYear().year ) {
					_this.getSelectedYear().selectedMonth = _this.pageMonth;
				}
			}
			
			redrawMonth();
			redrawDays();
			redrawYears();
			
			$(".next > *").remove();
			$(".previous > *").remove();
			
			// check wether there are years preceding or proceeding the selectedYear before creating the previous and next links
			if (_this.getYear(_this.selectedYear -1) != null)
			{
				$(".navigation .previous").append("<a>&laquo;</a>");
			}
			else
			{
				$(".navigation .previous").append("<span class='inactive'>&laquo;</span>");
			}
			if (_this.getYear(_this.selectedYear +1) != null)
			{
				$(".navigation .next").append("<a>&raquo;</a>");
			}
			else
			{
				$(".navigation .next").append("<span class='inactive'>&raquo;</span>");
			}
			
			// sets up the desired month navigation behaviours
			$(".navigation-month").click(function(){
				if (_this.getSelectedYear().getMonth($(this).attr('title')).getPostCount() > 0 && $(this).attr('title') != _this.getSelectedYear().selectedMonth )
				{
					$(".navigation-month:eq("+_this.getSelectedYear().selectedMonth+")").removeClass("selected");
					$(this).addClass("selected");
					_this.getSelectedYear().selectedMonth = $(this).attr('title');
					
					redrawYears();
					redrawDays();
				}
			});  
		});	
	}
    
	
	function redrawMonth () {
	
		$(".navigation-month").remove();
		$(".months").append(_this.getSelectedYear().toString());
		if (_this.pageYear == _this.getSelectedYear().year ) {
				$(".navigation-month:eq("+_this.pageMonth+")").addClass("selected");
		}
	}
	
	function redrawDays() {

		$(".navigation-day").fadeOut("fast", function () {
				$(".navigation-day").remove();
		});   
		
		setTimeout(function() {  //allow time for the fade out to stop
			$(".days").append(_this.getSelectedYear().getMonth(_this.getSelectedYear().selectedMonth).toString());
			$(".navigation-day").css("display", "none");
			
			$(".navigation-day").fadeIn("slow");
			if (_this.pageYear == _this.getSelectedYear().year && _this.getSelectedYear().selectedMonth == _this.pageMonth ) {
				$(".navigation-day:eq("+_this.pageDay+")").addClass("selected");   
			};
		}, 380);
	}
	
	function redrawYears() {
		$(".navigation-year").remove();
		$(".year").append("<span class='navigation-year'>"+_this.getSelectedYear().getYear()+"</span>");   
	}
}

/*
 * Class Year
 * A Year object is simply an array of Months
 * Requires a year number by which the Object can be referred and XML describing the Posts contained within each Month
 */ 
function Year(year, monthXML) {
	
	// functions
	
	this.getSelectedMonth = getSelectedMonth;
	this.createMonths = createMonths;
	this.getMonth = getMonth;
	this.toString = toString;
	this.getPostCount = getPostCount;
	this.getFirstMonth = getFirstMonth;
	this.getLastMonth = getLastMonth;
	this.getYear = getYear;
	
	
	// variables
	
	this.year = year;
	this.selectedMonth = getCurrentMonth();
	this.currentMonth = getCurrentMonth();
	this.selectedYear = getCurrentYear();
	this.currentYear = getCurrentYear();

	
	var months = createMonths(monthXML);
	this.postCount = 0;

	function getSelectedYear() {
	    return this.selectedYear;
	}
	
	function getYear() {
	    return this.year;
	}
	
	function getSelectedMonth() {
	    return this.selectedMonth;
	}
	
	/*
	 * Function createMonths
	 * Creates an array of Months from the provided XML
	 * Requires XML describing the Posts
	 */ 
	function createMonths(monthXML) {
		
		//todo write leap year functionality
		//todo make the day number selection happen within the Month Object creation
		var month_days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);		// for creating months with the correct number of days
		var monthArray = new Array(12);
		
		var count = 0;
		var _this = this;
		// create months with the correct number of days
		for (var i=0; i<12; i++)
		{
			monthArray[i] = new Month(i, month_days[i]);
		}
		
		// for each post element in the XML create a Post Object
		$("month", monthXML).each(function() {
			
			var monthNumber = $(this).find('number').text();
            
			$(this).find("post").each(function() {
                
                
                name = $(this).find("name").text();
                day = $(this).find("day").text();
                id = $(this).find("id").text(); 
                
				monthArray[monthNumber].addPost(name, day, id);
				_this.count++;
			});
		});
		return monthArray;
	}
	
	/*
	 * Function toString
	 * Returns a string containing the HTML required for displaying the Year object
	 */ 
	function toString() {
		var yearString = "";
	
		var monthNames = new Array("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec");
		
		for (var i = 0; i < 12; i++) {
			yearString += "<span class='navigation-month";
			if (i == this.selectedMonth) {
				yearString += " selected";
			}
			yearString += "' title='"+i+"'>";
			if (this.getMonth(i).getPostCount() > 0) {
				yearString += "<a>" + monthNames[i] + "</a>";
			} else {
                            yearString += monthNames[i];
                        }
			yearString+= "</span> ";
		}
		return yearString;
	}
	
	/*
	 * Function getMonth
	 * Returns the a Month Object from the monthArray
	 * Requires valid month number between 1 and 12
	 */ 
	function getMonth(monthNum){
		if (!(monthNum < 0) && !(monthNum > 12)){
			return months[monthNum];
		} else return null;
	}
	
	/*
	 * Function getPostCount
	 * Returns the number of posts in the Year
	 */ 
	function getPostCount(){
		// query data base to find number of posts in that year
		var count = 0;
		for (var i=0; i<12; i++) {
			
			count += months[i].getPostCount();
		}
		
		return count;

	}
	
	/*
	 * Function getLastMonth
	 * Returns the index of the last Month in the Rear with Posts
	 * Defaults to the first Month in the Year
	 */ 
	function getLastMonth() {
		for (var i = 11; i > 0; i-- ){
			if (months[i].getPostCount() > 0){
				return i;
			}
		}
		return 0;
	}
	
	/*
	 * Function getFirstMonth
	 * Returns the index of the first Month in the Rear with Posts
	 * Defaults to the last Month in the Year
	 */ 
	function getFirstMonth() {
		for (var i = 0; i < 12; i++ ){
			
			if (months[i].getPostCount() > 0){
				return i;
			}
		}
		return 11;
	}

}

/*
 * Class Month
 * A Month Object consists of an array of Post Objects
 * Requires a number by which the Month will be referred and the number of days the month will contain
 */ 
function Month( monthNum, daysNum) {
        
    //functions
	
	this.getMonthNum = getMonthNum;
	this.addPost = addPost;
	this.getPosts = getPosts;
	this.getPostCount = getPostCount;
	this.toString = toString;
	
	
	//variables
	
	this.postCount = 0;
	this.monthNum = monthNum;
	this.daysNum = daysNum;
	this.posts = new Array();
	
	function getMonthNum(){
		return monthNum;
	}
	
	function addPost (name, day, id){
		this.posts[this.postCount] = new Post(name, parseInt(day), parseInt(id));
		this.postCount++;
		
	}
	
	function getPosts() {
		return this.posts;
	}
	
	function getPostCount() {
		return this.postCount;
	}
	
	/*
	 * Function toString
	 * Returns a string containing the HTML required for displaying the Month object
	 */ 
	function toString() {
		var monthString = "";
		var startPointer = 1;
		for ( var i in this.posts ) {
			if (startPointer > this.posts[i].getDay()) {
				break;
			}
			while ( startPointer < this.posts[i].getDay() ) {
				if (startPointer == 1) {
					monthString += "<span class='navigation-day'>"+startPointer+"</span>"; 
				} else { 
					monthString += " <span class='navigation-day'>"+startPointer+"</span>";
				}				
				startPointer++;
			}
			if (startPointer  > 1) monthString += " ";
			monthString += "<span class='navigation-day'><a href='/?p="+this.posts[i].getId()+"' title='"+this.posts[i].getName()+"'>"+startPointer+"</a></span>";
			startPointer = this.posts[i].getDay() + 1;
		}
		while ( startPointer <= daysNum /*end of month*/ ) {
			if (startPointer == 1) {
				monthString += "<span class='navigation-day'>"+startPointer+"</span> "; 
			} else {
				monthString += " <span class='navigation-day'>"+startPointer+"</span>";
			}
			
			startPointer++;
		}

		return monthString;
		
	}
	
}

/*
 * Class Post
 * A Post Object is a simple data structure for recording the name, id, and day submitted of a Post
 */ 
function Post( name, day, id) {
	this.getName = getName;
	this.getDay = getDay;
	this.getId = getId;
		
	this.name = name;
	this.day = day;
	this.id = id;
        
	function getName(){
		return this.name;
	}
	
	function getDay(){
		return this.day;
	}
	
	function getId() {
		return this.id;
	}
}


/* ---- MISC FUNCTIONS ---- */

// Date functions

/*
 * Function getCurrentMonth
 * Returns the current month
 */
function getCurrentMonth() {
	return (parseInt(Date.today().toString('M'))-1);
}
/*
 * Function getCurrentYear
 * Returns the current year
 */
function getCurrentYear() {
	return (parseInt(Date.today().toString('yyyy')));
}

/*
 * Function getCurrentDay
 * Returns the current day
 */
function getCurrentDay() {
	return (parseInt(Date.today().toString('d'))-1);
}



