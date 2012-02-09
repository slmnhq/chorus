describe("chorus.views.visualizations.Timeseries", function() {
    beforeEach(function() {
        this.task = new chorus.models.SqlExecutionTask({
            objectName: "desk_surface_quality",
            yAxis: "gum_mass",
            xAxis: "observation_date",

            columns: [
                { name: "time", typeCategory: "DATE" },
                { name: "value",  typeCategory: "WHOLE_NUMBER" }
            ],
            rows: [
                { time: '2012-01-01', value: 321 },
                { time: '2012-02-01', value: 124 },
                { time: '2012-03-01', value: 321 },
                { time: '2012-04-01', value: 321 },
                { time: '2012-05-01', value: 421 },
                { time: '2012-06-01', value: 621 },
                { time: '2012-07-01', value: 524 },
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
            this.data = this.task.get("rows");
        });

        it("renders x and y axes with the correct labels", function() {
            expect(this.view.$(".xaxis .axis_label")).toHaveText("observation_date");
            expect(this.view.$(".yaxis .axis_label")).toHaveText("gum_mass");
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
                var times = _.pluck(this.data, "time");
                _.each(this.xs, function(x, i) {
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
