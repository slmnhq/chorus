jasmine.ProfileReporter = function() {
};

jasmine.ProfileReporter.prototype.createDom = function(type, attrs, childrenVarArgs) {
};

jasmine.ProfileReporter.prototype.reportRunnerStarting = function(runner) {
    this.timings = []
};

jasmine.ProfileReporter.prototype.reportRunnerResults = function(runner) {
    _(this.timings).each(function(timing) {
        console.log(timing.spec.id + " - " + timing.spec.getFullName() + " : " + timing.elapsedMs + "ms\n")
    })
};

jasmine.ProfileReporter.prototype.reportSuiteResults = function(suite) {
};

jasmine.ProfileReporter.prototype.reportSpecStarting = function(spec) {
    this.timings.push({
        startTime: Date.now(),
        spec: spec
    });
};

jasmine.ProfileReporter.prototype.reportSpecResults = function(spec) {
    if (this.timings.length > 0 && _(this.timings).last().spec.id === spec.id) {
        _(this.timings).last().endTime = Date.now();
        this.timings = _(this.timings).sortBy(function(timing){ timing.elapsedMs = timing.endTime - timing.startTime; return -timing.elapsedMs; }).slice(0, 10)
    }
};
