// Listen on port 9000
var gith = require("gith").create(9000);
// Import execFile, to run our bash script
var execFile = require("child_process").execFile;

gith({
	repo: "temple-acm/site"
}).on("all", function (payload) {
	if (payload.branch === "master") {
		// Exec a shell script
		execFile("hook.sh", function (error, stdout, stderr) {
			// Log success in some manner
			console.log("Hook execution complete.");
		});
	}
});