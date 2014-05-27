angular.module("mean.system").controller("CalendarCtrl", function ($scope) {
	$scope.renderCalendar = function() {

		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

		/*$.get( "https://www.googleapis.com/calendar/v3/calendars/gjksmp94jp8cfrmfofbkp2b6uo/events",
			function(data) {alert(data); },
			 "json" );*/

		$('#calendar').fullCalendar({
			editable:false,
			aspectRatio:2.5,
			events: {
				url:'https://www.google.com/calendar/feeds/temple.edu_qjorqhe6jebjduq23dmmgokhis%40group.calendar.google.com/public/basic'
	    		//eventClick: function() {}
	    	}
});
	};
});

/*
events: [
				{
					title: 'Test event',
					start: new Date(y, m, 1)
				}*/