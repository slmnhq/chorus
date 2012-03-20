describe("chorus.views.visualizations.Timeseries", function() {
    var leftX   = chorus.svgHelpers.leftX,
        rightX  = chorus.svgHelpers.rightX,
        width   = chorus.svgHelpers.width,
        height  = chorus.svgHelpers.height,
        centerX = chorus.svgHelpers.centerX,
        topY    = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY;

    beforeEach(function() {
        this.task = new chorus.models.SqlExecutionTask({
            objectName: "desk_surface_quality",
            yAxis: "gum_mass",
            xAxis: "observation_date",
            timeType: "DATE",

            columns: [
                { name: "time", typeCategory: "DATE" },
                { name: "value",  typeCategory: "WHOLE_NUMBER" }
            ],
            rows: [
                { time: '2012-01-01', value: 321 },
                { time: '2012-02-21', value: 124 },
                { time: '2012-03-01', value: 321 },
                { time: '2012-04-01', value: 321 },
                { time: '2012-05-01', value: 421 },
                { time: '2012-07-08', value: 524 },
                { time: '2012-08-01', value: 824 },
                { time: '2012-09-01', value: 924 },
                { time: '2012-10-01', value: 724 }
            ]
        });

        this.view = new chorus.views.visualizations.Timeseries({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();

            this.path = this.view.$("path");
            this.xAxisLine = this.view.$(".xaxis line.axis");
            this.data = this.task.get("rows");
        });

        it("renders x and y axes with the correct labels", function() {
            expect(this.view.$(".xaxis .axis_label")).toHaveText("observation_date");
            expect(this.view.$(".yaxis .axis_label")).toHaveText("gum_mass");
        });

        it("formats the times correctly", function() {
            var labels = this.view.$(".label")
            expect(labels[0].textContent).toBe("2012-01-01")
        })

        describe("re-rendering", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("does not create multiple charts", function() {
                expect(this.view.$("svg.chart").length).toBe(1);
            });
        });

        describe("the path", function() {
            beforeEach(function() {
                this.xs = pathXs(this.path);
                this.ys = pathYs(this.path);
            });

            it("renders a single path representing the data", function() {
                expect(this.path.length).toBe(1);
            });

            it("includes a point for every entry in the dataset", function() {
                expect(this.xs.length).toBe(this.data.length);
                expect(this.xs.length).toBe(this.data.length);
            });

            xit("positions the points horizontally according to their time value", function() {
                var times = _.map(this.data, function(d) { return Date.parse(d.time) });
                var deltaX = rightX(this.xAxisLine) - leftX(this.xAxisLine);
                var deltaTime = _.last(times) - _.first(times);

                _.each(this.xs, function(x, i) {
                    var xRatio = (x - this.xs[0]) / deltaX;
                    var timeRatio = (times[i] - times[0]) /  deltaTime;
                    expect(xRatio).toBeCloseTo(timeRatio, 1);
                }, this);
            });

            it("positions the points vertically according to their y value", function() {
                var values = _.pluck(this.data, "value")

                _.each(this.ys, function(y, i) {
                    if (i === 0) return;

                    if (values[i] > values[i-1]) {
                        expect(y).toBeLessThan(this.ys[i-1])
                    } else if (values[i] < values[i-1]) {
                        expect(y).toBeGreaterThan(this.ys[i-1])
                    } else {
                        expect(y).toBe(this.ys[i-1])
                    }
                }, this);
            });
        });
    });

    function pathYs(path) {
        var pointString = $(path).attr("d");
        var pairs = pointString.replace(/M/, "").split("L");
        return _.map(pairs, function(pair) {
            return parseFloat(pair.split(",")[1]);
        });
    }

    function pathXs(path) {
        var pointString = $(path).attr("d");
        var pairs = pointString.replace(/M/, "").split("L");
        return _.map(pairs, function(pair) {
            return parseFloat(pair.split(",")[0]);
        });
    }
});
