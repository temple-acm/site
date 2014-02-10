angular.module("mean.system").controller("RegisterFormController", function ($scope, $http, $upload) {
	// Constants
	var SUBMIT_URL = "members/register";
	var DRAG_DROP_NEUTRAL = "Drag & Drop Your Resume Here";
	var DRAG_DROP_STYLE_NEUTRAL = "";
	var DRAG_DROP_WRONG_TYPE = "Provided file was the wrong type";
	var DRAG_DROP_WRONG_SIZE = "Provided file was too big";
	var DRAG_DROP_STYLE_WRONG = "wrong";
	var DRAG_DROP_RIGHT = "Resume file \"%s\" is ready to upload";
	var DRAG_DROP_STYLE_RIGHT = "dropped";
	// Instance variables
	$scope.pendingFile = null;
	$scope.dragDropMessage = DRAG_DROP_NEUTRAL;
	$scope.dragDropStyle = DRAG_DROP_STYLE_NEUTRAL;

	$scope.submit = function (user) {
		console.log(user);
		$('#register-modal').modal("show");
		// console.log("test() was fired:");
		// console.log(user);
		// if ($scope.pendingFile) {
		// 	$scope.upload = $upload.upload({
		// 		url: SUBMIT_URL,
		// 		method: "POST",
		// 		data: user,
		// 		file: $scope.pendingFile,
		// 		fileFormDataName: "resume"
		// 	}).progress(function (evt) {
		// 		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		// 	}).success(function (data, status, headers, config) {
		// 		// file is uploaded successfully
		// 		console.log("Much success.");
		// 		console.log(data);
		// 	});
		// }
	};

	$scope.selectFile = function ($files, user) {
		//$files: an array of files selected, each file has name, size, and type.
		var file = $files[0]; // Assume just one file
		var extension = file.name.split(".").pop().toLowerCase();
		// Check extension
		if (extension !== "doc" && extension !== "docx" && extension !== "pdf") {
			$scope.dragDropStyle = DRAG_DROP_STYLE_WRONG;
			$scope.dragDropMessage = DRAG_DROP_WRONG_TYPE;
		} else if (file.size > 1048576) {
			$scope.dragDropStyle = DRAG_DROP_STYLE_WRONG;
			$scope.dragDropMessage = DRAG_DROP_WRONG_SIZE;
		} else {
			// Set the file instance variable
			$scope.pendingFile = file;
			// Cosmetics
			$scope.dragDropStyle = DRAG_DROP_STYLE_RIGHT;
			$scope.dragDropMessage = DRAG_DROP_RIGHT.replace("%s", file.name);
		}
	};
});