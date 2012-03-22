/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 300001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 500); //< repeat check every 100ms
};


if (phantom.args.length > 1) {
    console.log('Usage: run-jasmine.js [spec_name_filter]');
    phantom.exit(1);
}

var page = require('webpage').create();
var fs = require('fs');

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    // console.log(msg);
    fs.write( '/dev/stdout', msg, 'w' );
};

var url = 'http://localhost:8888/'
if (phantom.args[0]) {
    url += '?spec=' + encodeURIComponent(phantom.args[0]);
}

page.open(url, function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        page.evaluate(function() {
            if (window.phantomInitialized) {
                return;
            }

            window.phantomInitialized = true;

            // don't do any setTimeout garbage
            jasmine.getEnv().updateInterval = null;
            var phantomReporter = {
                reportSpecResults: function(spec) {
                    if (spec.results().skipped) {
                        // nothing for now!
                    } else if (spec.results().passed()) {
                        console.log(".");
                    } else {
                        console.log("\nF (" + spec.getFullName()  + ")\n");

                        var resultItems = spec.results().getItems();
                        _.each(resultItems, function(result) {
                            if (result.type == 'expect' && result.passed && !result.passed()) {
                                console.log(">>>" + result.message + "\n");
                            }
                        });
                    }
                }
            };
            phantomReporter.prototype = jasmine.Reporter;
            jasmine.getEnv().addReporter(phantomReporter);
        });
        waitFor(function(){
            return page.evaluate(function(){
                return !jasmine.getEnv().currentRunner().queue.running;
            });
        }, function(){
            var exitCode = page.evaluate(function(){
                var passedCount = 0,
                    failedCount = 0,
                    skippedCount = 0;
                _.each(jasmine.getEnv().currentRunner().specs(), function(spec) {
                    if (spec.results().skipped) {
                        skippedCount++;
                        return;
                    }

                    if (spec.results().failedCount > 0) {
                        failedCount++;
                    } else {
                        passedCount++;
                    }
                });

                console.log("Specs passed:  " + passedCount + "\n");
                console.log("Specs skipped: " + skippedCount + "\n");
                console.log("Specs failed:  " + failedCount + "\n");
                return failedCount;
            });
            phantom.exit(exitCode);
        });
    }
});
