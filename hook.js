// Listen on port 9000
var gith = require("gith").create(9000);
// Import execFile, to run our bash script
var execFile = require("child_process").execFile;

function getDateTime() {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if (month.toString().length == 1) {
		var month = '0' + month;
	}
	if (day.toString().length == 1) {
		var day = '0' + day;
	}
	if (hour.toString().length == 1) {
		var hour = '0' + hour;
	}
	if (minute.toString().length == 1) {
		var minute = '0' + minute;
	}
	if (second.toString().length == 1) {
		var second = '0' + second;
	}
	var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
	return dateTime;
}

gith({
	repo: "temple-acm/site"
}).on("all", function (payload) {
	if (payload.branch === "master") {
		// Exec a shell script
		console.log(getDateTime() + "\tExecuting git deploy of acm-site...");
		execFile("/srv/tuacm.org/hook.sh", function (error, stdout, stderr) {
			if (error) console.log(error);
			console.log(stdout);
			// Log success in some manner
			console.log(getDateTime() + "\t...DONE.");
		});
	}
});
// Listen on port 9000
var gith = require("gith").create(9000);
// Import execFile, to run our bash script
var execFile = require("child_process").execFile;

function getDateTime() {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if (month.toString().length == 1) {
		var month = '0' + month;
	}
	if (day.toString().length == 1) {
		var day = '0' + day;
	}
	if (hour.toString().length == 1) {
		var hour = '0' + hour;
	}
	if (minute.toString().length == 1) {
		var minute = '0' + minute;
	}
	if (second.toString().length == 1) {
		var second = '0' + second;
	}
	var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
	return dateTime;
}

gith({
	repo: "temple-acm/site"
}).on("all", function (payload) {
	if (payload.branch === "master") {
		// Exec a shell script
		console.log(getDateTime() + "\tExecuting git deploy of acm-site...");
		execFile("/srv/tuacm.org/hook.sh", function (error, stdout, stderr) {
			if (error) console.log(error);
			console.log("\n" + stdout);
			// Log success in some manner
			console.log(getDateTime() + "\t...DONE.");
		});
	}
});