var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');
var exec = require('child_process').exec;

var PLUGIN_NAME = 'gulp-tfs';

var gulpTfs = function (opts) {
	opts = setDefaultOptions(opts);
	return through.obj(function (file, enc, cb) {
		var that = this;
		checkForTFS(function (result) {

			if (result) {
				if (!fs.existsSync(file.path)) {
					throw new PluginError(PLUGIN_NAME, "File does not exist");
				}

				if (process.platform !== 'win32') {
					throw new PluginError(PLUGIN_NAME, "This plugin can only be used on a Windows system with Visual Studio installed");
				}

				var command = 'tf ' + opts.command + ' "' + file.path + '"';
				exec(command, function (err, stdout, stderr) {
					"use strict";
					processExecResults(err, stdout, stderr);
					gutil.log('TF result: command ' + opts.command + " on file " + gutil.colors.cyan(stdout));
					that.push(file);
					cb();
				});
			}
			else {
				gutil.log('TF command is not found.');
				that.push(file);
				cb();
			}
		});
	});
};

var setDefaultOptions = function (opts) {
	var validCommands = ['edit', 'lock'];
	opts = opts || {};
	opts.command = opts.command || 'edit';
	if (validCommands.indexOf(opts.command) < 0) {
		throw new PluginError(PLUGIN_NAME, "The only commands currently implemented are 'edit' and 'lock'");
	}
	return opts;
};

var processExecResults = function (err, stdout, stderr) {
	var returnVal;
	if (stderr) {
		returnVal = stderr;
		gutil.log('TF command error: ' + gutil.colors.cyan(stderr) + " -- " + gutil.colors.red(returnVal));
	} else if (err) {
		returnVal = err;
		gutil.log('TF command caution: ' + gutil.colors.cyan(stdout) + " -- " + gutil.colors.yellow(returnVal));
	}
	else {
		returnVal = stdout;
	}
	return returnVal;
};

var checkForTFS = function (done) {
	exec('tf bob', function (err, stdout, stderr) {
		//not a tf command, but validates that tf throws the right error
		//this ensures that the tf command is available
		if (stderr === 'Unrecognized command: bob.\r\n') {
			done(true);
		}
		else {
			throw new PluginError(PLUGIN_NAME, 'TF command is not available. Make sure Visual Studio is installed and its install directory is in your %PATH%');
		}
	});
};

module.exports = gulpTfs;
module.exports.checkForTFS = checkForTFS;
module.exports.processExecResults = processExecResults;
module.exports.setDefaultOptions = setDefaultOptions;

