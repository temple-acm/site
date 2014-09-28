var FeedParser = require('feedparser'),
	request = require('request'),
	entities = require('entities'),
	async = require('async');

/******************************* MODULE HELPERS *******************************/

// Query templates for Google Calendar Feeds API v2
var CALENDAR_ENDLESS_RSS_URL = 'https://www.google.com/calendar/feeds/tuacm%40temple.edu/public/basic?orderby=starttime&sortorder=ascending&start-min={{start}}';
var CALENDAR_BOUNDED_RSS_URL = 'https://www.google.com/calendar/feeds/tuacm%40temple.edu/public/basic?orderby=starttime&sortorder=ascending&start-min={{start}}&start-max={{end}}';
// Quantity of events to return by default
var UPCOMING_EVENTS_LIMIT = 6;

// Date helper for google calendar
var padDigit = function(n) {
	return (n < 10) ? ('0' + n) : n;
};

// Formats a Date 'd' into ISO timestamp format
var toISODateString = function(d) {
	return d.getUTCFullYear() + '-' + padDigit(d.getUTCMonth() + 1) + '-' + padDigit(d.getUTCDate()) + 'T' + padDigit(d.getUTCHours()) + ':' + padDigit(d.getUTCMinutes()) + ':' + padDigit(d.getUTCSeconds()) + 'Z';
};

// Generates a new events feed parser
var newEventParser = function(events, callback, queryIndex) {
	var parser = new FeedParser(),
		rssEntries = [];
	// Called when the parser grabs an RSS entry
	parser.on('readable', function() {
		var rssEntry;

		while (rssEntry = this.read()) {
			// Cache the RSS entries
			if (rssEntries.length <= UPCOMING_EVENTS_LIMIT) {
				rssEntries.push(rssEntry);
			}
		}
	});
	// Called when we reach the end of the RSS stream
	parser.on('end', function() {
		for (var i = 0; i < rssEntries.length; i++) {
			var data, when, where, desc, status, evt;
			// We're out of entries, exit
			if (!rssEntries[i]) continue;
			// Parse the rss entry
			evt = {
				title: entities.decodeHTML(rssEntries[i].title),
				link: rssEntries[i].link,
				queryIndex: queryIndex,
				eventIndex: i
			};
			// 2 fields are hidden in the "desciption" rss field
			data = rssEntries[i].description.split('\n');
			for (var ii = 0; ii < data.length; ii++) {
				// Look for description
				desc = data[ii].match(/Event Description: (.*)/);
				if (desc) {
					evt.description = desc[1];
				}
				// Look for status
				status = data[ii].match(/Event Status: (.*)/);
				if (status) {
					evt.status = status[1];
				}
			}
			// 2 fields are hidden in the "summary" rss field
			data = rssEntries[i].summary.split('\n');
			for (var ii = 0; ii < data.length; ii++) {
				when = data[ii].match(/^(<br>)?When: (.*)$/);
				where = data[ii].match(/^(<br>)?Where: (.*)$/);
				// Actual HTML escaping fix
				if (when) {
					evt.when = entities.decodeHTML(when[2]);
				}
				if (where) {
					evt.where = entities.decodeHTML(where[2]);
				}
			}
			// Put the events in a list
			if (evt.when) {
				events.push(evt);
			}
		}
		// Return the list when we're done
		callback();
	});
	return parser;
};

// Generates a function that executes a request and parses the events
// Qs = The querystring for the HTTP GET request
// Events = The events array
// I = The index of this query
var newEventQuery = function(qs, events, i) {
	return function(callback) {
		request(qs)
			.on('response', function(response) {
				this.pipe(newEventParser(events, callback, i));
			})
			.on('error', function(err) {
				callback(err);
			});
	};
};

// Generates async-parallel-formatted sequence of event readers
// Events = The events array
// Split Length = How many days each event reader reads
// Split Count = How many concurrent readers to use
var newEventQuerySet = function(events, splitLength, splitCount) {
	var querySet = [];
	for (var i = 0; i < splitCount; i++) {
		var startDate = new Date(),
			endDate = new Date(),
			queryString;
		// Move dates accordingly
		startDate.setDate(startDate.getDate() + (i * splitLength));
		endDate.setDate(endDate.getDate() + ((i + 1) * splitLength));
		// Build query string
		if (i < splitCount - 1) {
			queryString = CALENDAR_BOUNDED_RSS_URL
				.replace('{{start}}', toISODateString(startDate))
				.replace('{{end}}', toISODateString(endDate));
		} else {
			queryString = CALENDAR_ENDLESS_RSS_URL
				.replace('{{start}}', toISODateString(startDate));
		}
		// Add a function to the query set
		querySet.push(newEventQuery(queryString, events, i));
	}
	return querySet;
};

// Comparison functions used for sorting array events
var eventComparator = function(event1, event2) {
	if (event1.queryIndex < event2.queryIndex) {
		return -1;
	} else if (event1.queryIndex > event2.queryIndex) {
		return 1;
	} else {
		if (event1.eventIndex < event2.eventIndex) {
			return -1;
		} else if (event1.eventIndex > event2.eventIndex) {
			return 1;
		} else {
			return 0;
		}
	}
};

/******************************** EVENTS ROUTES *******************************/

exports.route = function(app) {
	/*
	 * This endpoint retrieves ACM Google Calendar data from the publically-available
	 * XML feed. It then collects the next (read: upcoming) three entries and sends
	 * them back as an array of objects.
	 *
	 * Output:
	 *  Success:
	 *      status: 200
	 *      data: { "200" : events } where "events" is an array of event objects.
	 *  Error:
	 *      If XML request fails:
	 *          status: 200
	 *          data: { "500" : err } where "err" is the error message returned
	 */
	app.get('/events/calendar', function(req, res) {
		// The array of events
		var events = [];

		// Get the event count
		var eventCount = parseInt(req.param('count'));
		if (!eventCount) {
			eventCount = UPCOMING_EVENTS_LIMIT;
		}
		// Calculate how many weeks to query for assuming approx. 2 events per week
		var weekCount = Math.ceil(eventCount / 2);

		// Grab the calendar data
		async.parallel(newEventQuerySet(events, 7, weekCount), function(err) {
			if (err) {
				logger.log('error', err);
				res.status(200).json({
					'500': 'Error retriving calendar data'
				});
			} else {
				// Sort the events array
				events.sort(eventComparator);
				// Limit the events array to event count
				events = events.slice(0, eventCount);
				// Return the events array
				res.status(200).json({
					'200': events
				});
			}
		});
	});

	/********************************** TRANSIENT EVENT REDIRECTS *********************************/

	app.get('/microsoft', function(req, res) {
		res.redirect('https://www.eventbrite.com/e/microsoft-venture-capital-tickets-12925688081');
	});
};