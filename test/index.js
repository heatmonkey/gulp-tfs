'use strict';
var chai = require('chai');
var gulpTfs = require('../index.js');
var expect = chai.expect;
var assert = chai.assert;

describe('gulp-tfs', function () {
	describe('Find Visual Studio', function () {
		var progFiles;

		before(function (done) {
			gulpTfs.checkForTFS(function (data) {
				progFiles = data;
				done();
			});
		});

		it('Validates the availability of the TF.EXE command and path', function () {
			expect(progFiles).to.equal(true);
		});
	});

	describe('Set options for acceptable commands', function(){
		it('Should set the default command to edit', function(){
			assert.deepEqual(gulpTfs.setDefaultOptions(), { command: 'edit'});
		});

		it('Should throw an error if command is not valid', function(){
			expect(function(){ gulpTfs.setDefaultOptions({command: 'bob'})}).to.throw("The only commands currently implemented are 'edit' and 'lock'");
		});

	});

	describe('Exec callback must respond to err, stdout and stderr', function () {
		it('Should throw an exception on a stderr', function () {
			expect(function () {
				gulpTfs.execCallback(null, null, "STDError: Message");
			})
				.to.throw("STDError: Message");
		});
		it('Should throw an exception on a err', function () {
			expect(function () {
				gulpTfs.execCallback("Error: Message", null, null);
			})
				.to.throw("Error: Message");
		});
		it('Should return data for stdout', function () {
			assert.equal(gulpTfs.execCallback(null, "STDOut: Message", null),"STDOut: Message");
		});
	});
});

