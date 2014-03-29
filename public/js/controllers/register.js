angular.module("mean.system").service("RegisterService", function ($http) {
    this.isUserNameFree = function (userName, callback) {
        $http({
            method: "GET",
            url: "/members/isUserNameFree",
            params: {
                username: userName
            }
        }).success(function (data, status, headers, config) {
            callback(null, data);
        }).error(function (data, status, headers, config) {
            callback(data);
        });
    };
});

angular.module("mean.system").controller("RegistrationController", function ($rootScope, $scope) {
    // True if we're redirecting to paypal
    $scope.registered = false;
    // Sets registered to true
    $scope.declareRegistered = function () {
        $scope.registered = true;
    };
});

angular.module("mean.system").controller("RegisterFormController", function ($rootScope, $scope, $http, $upload, RegisterService) {
    // Constants
    var SUBMIT_URL = "members/register";
    var RESUME_DROP_URL = "members/resumes/drop";
    var DRAG_DROP_NEUTRAL = "Drag & Drop Your Resume Here";
    var DRAG_DROP_STYLE_NEUTRAL = "";
    var DRAG_DROP_WRONG_TYPE = "Provided file was the wrong type";
    var DRAG_DROP_WRONG_SIZE = "Provided file was too big";
    var DRAG_DROP_STYLE_WRONG = "wrong";
    var DRAG_DROP_RIGHT = "Resume file \"%s\" is ready to upload";
    var DRAG_DROP_STYLE_RIGHT = "dropped";
    // This template is used to redirect to the payment form @ paypal
    var PAYPAL_API_CALL_TEMPLATE = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd"' +
        ' value="_s-xclick"><input type="hidden" name="hosted_button_id" value="6CYDNKB4YDGVC"><input type="hidden" name="notify_url" ' +
        ' value="http://acm.temple.edu/members/payments/callback/{{id}}"></form>';
    // Does the same thing as PAYPAL_API_CALL_TEMPLATE - except it does it with fake money
    var FAKE_PAYPAL_API_CALL_TEMPLATE = '<form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd"' +
        ' value="_s-xclick"><input type="hidden" name="hosted_button_id" value="9M38CDYV8EHEJ"><input type="hidden" name="notify_url" ' +
        ' value="http://acm.temple.edu/members/payments/callback/{{id}}"></form>';
    var PAYPAL_API_CALL_ID_TOKEN = '{{id}}';
    // Instance variables
    $scope.pendingFile = null;
    $scope.dragDropMessage = DRAG_DROP_NEUTRAL;
    $scope.dragDropStyle = DRAG_DROP_STYLE_NEUTRAL;

    // Redirects to payment url
    var doPayment = function (userId) {
        $scope.declareRegistered();
        $(FAKE_PAYPAL_API_CALL_TEMPLATE.replace(PAYPAL_API_CALL_ID_TOKEN, userId)).submit();
    };
    // Create the new user
    var doRegistration = function (user) {
        $http.post(SUBMIT_URL, user).success(function (data, status, headers, config) {
            $rootScope.me = data;
            // Pass the id as a reference
            console.log('result', data);
            doPayment(data._id);
        }).error(function (data, status, headers, config) {
            $('#register-modal').modal("show");
            console.log('problem', data);
        });
    };

    $scope.submit = function (user) {
        if ($scope.registrationForm.$valid) {
            if ($scope.pendingFile) {
                $scope.upload = $upload.upload({
                    url: RESUME_DROP_URL,
                    method: "POST",
                    file: $scope.pendingFile
                }).success(function () {
                    doRegistration(user);
                }).error(function () {
                    alert('File upload failed.');
                    console.log('File upload failed', arguments);
                });
            } else {
                doRegistration(user);
            }
        } else {
            $('#register-modal').modal("show");
        }
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

    $scope.onUserIdChanged = function () {
        var val = $("#userIdText").val();
        if (val && val.length >= 5 && val.length <= 15 && /^[a-z0-9\.]+$/i.test(val)) {
            RegisterService.isUserNameFree($("#userIdText").val(), function (err, isFree) {
                if (isFree) {
                    $("#userIdIndicator").addClass("good");
                    $("#userIdIndicator").html("This user id is available.");
                    // Mark the field valid
                    $scope.registrationForm.userId.$setValidity("id", true);
                } else {
                    $("#userIdIndicator").removeClass("good");
                    $("#userIdIndicator").html("This user id is taken.");
                    // Mark the field invalid
                    $scope.registrationForm.userId.$setValidity("id", false);
                }
            });
        } else {
            $("#userIdIndicator").removeClass("good");
            $("#userIdIndicator").html("User id format invalid.");
            // Mark the field invalid
            $scope.registrationForm.userId.$setValidity("id", false);
        }
    };

    $scope.onPasswordChanged = function () {
        var pass = $("#passwordText").val();
        var conf = $("#confirmPasswordText").val();
        if (/^(?=.*[^a-zA-Z])(?=.*[a-z])(?=.*[A-Z])\S{8,}$/.test(pass)) {
            RegisterService.isUserNameFree($("#userIdText").val(), function (err, isFree) {
                if (pass === conf) {
                    $("#passwordIndicator").addClass("good");
                    $("#passwordIndicator").html("This password is valid.");
                    // Mark the field valid
                    $scope.registrationForm.password.$setValidity("pass", true);
                } else {
                    $("#passwordIndicator").removeClass("good");
                    $("#passwordIndicator").html("The passwords don't match.");
                    // Mark the field invalid
                    $scope.registrationForm.password.$setValidity("pass", false);
                }
            });
        } else {
            $("#passwordIndicator").removeClass("good");
            $("#passwordIndicator").html("Password format invalid.");
            // Mark the field invalid
            $scope.registrationForm.password.$setValidity("pass", false);
        }
    };

    // Code to validate the form
    var validate = function () {

    };
});