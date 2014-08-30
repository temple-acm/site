var FeedParser = require('feedparser'),
	request = require('request'),
	entities = require('entities');

/******************************* MODULE HELPERS *******************************/

var CALENDAR_RSS_URL = 'https://www.google.com/calendar/feeds/tuacm%40temple.edu/public/basic?orderby=starttime&sortorder=ascending&start-min={{isoDateTime}}';
var UPCOMING_EVENTS_LIMIT = 3;

// Date helper for google calendar
var padDigit = function(n) {
	return (n < 10) ? ('0' + n) : n;
};

// Formats a Date 'd' into ISO timestamp format
var toISODateString = function(d) {
	return d.getUTCFullYear() + '-' + padDigit(d.getUTCMonth() + 1) + '-' + padDigit(d.getUTCDate()) + 'T' + padDigit(d.getUTCHours()) + ':' + padDigit(d.getUTCMinutes()) + ':' + padDigit(d.getUTCSeconds()) + 'Z';
};

/******************************** MEMBER ROUTES *******************************/

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
		var parser = new FeedParser(),
			rssEntries = [],
			events = [];
		// Grab the calendar data
		request(CALENDAR_RSS_URL.replace('{{isoDateTime}}', toISODateString((new Date()))))
			.on('response', function() {
				// Pipe the calendar data into the feed parser
				this.pipe(parser);
			})
			.on('error', function(err) {
				res.status(200).json({
					'500': err
				});
			});
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
			for (var i = 0; i < UPCOMING_EVENTS_LIMIT; i++) {
				var data, when, where, desc, status, evt;
				// Parse the rss entry
				evt = {
					title: rssEntries[i].title,
					link: rssEntries[i].link
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
				events.push(evt);
			}
			// Return the list when we're done
			res.status(200).json({
				'200': events
			});
		});
	});
};