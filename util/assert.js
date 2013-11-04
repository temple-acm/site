/************************************** EXTERNAL IMPORTS ******************************************/

var underscore = require("underscore"); // The it-does-everything utility library

/************************************** INTERNAL IMPORTS ******************************************/

var ex = require("./exception.js");

/******************************************* MODULE ***********************************************/

var readParameters = function(args) {
    if (args.length < 2) throw new ex.IllegalArgumentException("Requires two parameters: one must be the name of the variable, the other must be a variable of any type.");
    if (underscore.isString(args[0])) return {
        name: args[0],
        parameter: args[1]
    };
    else if (underscore.isString(args[1])) return {
        name: args[1],
        parameter: args[0]
    };
    else throw new ex.IllegalArgumentException("Requires two parameters: one must be the name of the variable, the other must be a variable of any type.");
}

/******************************************* EXPORTS **********************************************/

module.exports.func = function() {
    var args = readParameters(arguments);
    if (!args.parameter) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter was null.");
    if (!underscore.isFunction(args.parameter)) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter must be a function.");
};

module.exports.string = function() {
    if (!arguments[0]) throw new ex.IllegalArgumentException("The '" + arguments[1] + "' parameter was null.");
    if (!underscore.isString(arguments[0])) throw new ex.IllegalArgumentException("The '" + arguments[1] + "' parameter must be a string.");
};

module.exports.number = function() {
    var args = readParameters(arguments);
    if (!args.parameter) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter was null.");
    if (!underscore.isNumber(args.parameter)) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter must be a number.");
};

module.exports.boolean = function() {
    var args = readParameters(arguments);
    if (!args.parameter) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter was null.");
    if (!underscore.isBoolean(args.parameter)) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter must be a boolean.");
};

module.exports.object = function() {
    var args = readParameters(arguments);
    if (!args.parameter) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter was null.");
    if (!underscore.isObject(args.parameter)) throw new ex.IllegalArgumentException("The '" + args.name + "' parameter must be a object.");
}