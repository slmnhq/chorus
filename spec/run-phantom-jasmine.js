// Part of OpenPhantomScripts
// http://github.com/mark-rushakoff/OpenPhantomScripts

// Copyright (c) 2012 Mark Rushakoff

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var fs = require("fs");

// var system = require("system");
// var args = system.args;

var args = phantom.args;
var port = args[0];
var filter = args[1];
var url = 'http://localhost:' + port

if (filter) {
    url += '?spec=' + encodeURIComponent(filter);
}

if (!parseInt(port) || args.length > 2) {
    console.log('Usage: run-jasmine.js PORT [spec_name_filter]');
    phantom.exit(1);
}

function printError(message) {
    fs.write("/dev/stderr", message + "\n", "w");
}

var page = require("webpage").create();

var attachedDoneCallback = false;
page.onResourceReceived = function() {
    // Without this guard, I was occasionally seeing the done handler
    // pushed onto the array multiple times -- it looks like the
    // function was queued up several times, depending on the server.
    if (!attachedDoneCallback) {
        attachedDoneCallback = page.evaluate(function() {
            if (window.jasmine) {
                var reporter = {
                    failures: [],

                    numPassed: 0,
                    numFailed: 0,
                    numSkipped: 0,

                    reportRunnerStarting: function() {
                        this.startTime = (new Date()).getTime();
                    },

                    reportSpecResults: function(spec) {
                        var results = spec.results();
                        if (results.skipped) {
                            this.numSkipped++;
                        } else if (results.passed()) {
                            this.numPassed++;
                            console.log(".");
                        } else {
                            this.numFailed++;

                            var name = spec.getFullName();
                            var failedExpectations = _.filter(spec.results().getItems(), function(item) {
                                return (item.type == 'expect') && item.passed && !item.passed()
                            });
                            var messages = _.map(failedExpectations, function(expectation) {
                                return expectation.message;
                            });
                            this.failures.push({ name: name, messages: messages });

                            console.log("F");
                        }
                    },

                    reportRunnerResults: function() {
                        var totalTime = (new Date()).getTime() - this.startTime;
                        var totalTests = (this.numPassed + this.numSkipped + this.numFailed);

                        _.each(this.failures, function(failure, i) {
                            console.log("\n\n" + (i+1) + ") " + failure.name);
                            _.each(failure.messages, function(message) {
                                console.log("\n" + message);
                            });
                        });

                        console.log("\n");
                        console.log("\nTests passed:  " + this.numPassed);
                        console.log("\nTests skipped: " + this.numSkipped);
                        console.log("\nTests failed:  " + this.numFailed);
                        console.log("\nTotal tests:   " + totalTests);
                        console.log("\nRuntime (ms):  " + totalTime);
                        console.log("\n\n");

                        window.phantomComplete = true;
                        window.phantomResults = {
                            numPassed: this.numPassed,
                            numSkipped: this.numSkipped,
                            numFailed: this.numFailed,
                            totalTests: totalTests,
                            totalTime: totalTime
                        };
                    }
                };

                window.jasmine.getEnv().addReporter(reporter);

                return true;
            }

            return false;
        });
    }
}

page.onConsoleMessage = function(message) {
    fs.write('/dev/stdout', message, 'w');
}

page.open(url, function(success) {
    if (success === "success") {
        if (!attachedDoneCallback) {
            printError("Phantom callbacks not attached in time.  See http://github.com/mark-rushakoff/OpenPhantomScripts/issues/1");
            phantom.exit(1);
        }

        setInterval(function() {
            if (page.evaluate(function() { return window.phantomComplete; })) {
                var failures = page.evaluate(function() {return window.phantomResults.numFailed;});
                phantom.exit(failures);
            }
        }, 250);
    } else {
        printError("Failure opening " + url);
        phantom.exit(1);
    }
});
