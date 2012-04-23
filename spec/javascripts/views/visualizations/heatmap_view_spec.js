describe("chorus.views.visualizations.Heatmap", function() {
    var leftX   = chorus.svgHelpers.leftX,
        rightX  = chorus.svgHelpers.rightX,
        width   = chorus.svgHelpers.width,
        height  = chorus.svgHelpers.height,
        centerX = chorus.svgHelpers.centerX,
        topY    = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY;

    beforeEach(function() {
        this.addMatchers(chorus.svgHelpers.matchers);
        this.addMatchers({
            toAllBeEqual: function() {
                var firstValue = this.actual[0];
                return _.all(this.actual, function(element) {
                    return _.isEqual(element, firstValue);
                });
            },

            toBeDarkerThan: function(el) {
                var fill1 = $.color.extract($(this.actual), "fill"),
                    fill2 = $.color.extract($(el), "fill");
                return relativeLightness(fill1) < relativeLightness(fill2);
            }
        });
    });

    beforeEach(function() {
        this.task = fixtures.heatmapTaskWithResult({
            xAxis: "hair_length",
            yAxis: "kill_count",
            xBins: "4",
            yBins: "3",
            rows: [
                { yLabel: [30, 71.8],     xLabel: [0, 1.8],   value: 39541, y: 1, x: 1 },
                { yLabel: [71.8, 113.6],  xLabel: [0, 1.8],   value: 39873, y: 2, x: 1 },
                { yLabel: [113.6, 155.4], xLabel: [0, 1.8],   value: 39993, y: 3, x: 1 },
                { yLabel: [30, 71.8],     xLabel: [1.8, 3.6], value: 39818, y: 1, x: 2 },
                { yLabel: [71.8, 113.6],  xLabel: [1.8, 3.6], value: 39838, y: 2, x: 2 },
                { yLabel: [113.6, 155.4], xLabel: [1.8, 3.6], value: 39911, y: 3, x: 2 },
                { yLabel: [30, 71.8],     xLabel: [3.6, 5.4], value: 39631, y: 1, x: 3 },
                { yLabel: [71.8, 113.6],  xLabel: [3.6, 5.4], value: 40174, y: 2, x: 3 },
                { yLabel: [113.6, 155.4], xLabel: [3.6, 5.4], value: 39700, y: 3, x: 3 },
                { yLabel: [30, 71.8],     xLabel: [5.4, 7.2], value: 40551, y: 1, x: 4 },
                { yLabel: [71.8, 113.6],  xLabel: [5.4, 7.2], value: 40411, y: 2, x: 4 },
                { yLabel: [113.6, 155.4], xLabel: [5.4, 7.2], value: 39841, y: 3, x: 4 },
            ]
        });

        this.width = 925;
        this.height = 340;
        this.view = new chorus.views.visualizations.Heatmap({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();

            this.minX = this.view.axes.scales().x.range()[0];
            this.maxX = this.view.axes.scales().x.range()[1];
            this.minY = this.view.axes.scales().y.range()[1];
            this.maxY = this.view.axes.scales().y.range()[0];
        });

        describe("re-rendering", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("does not create multiple charts", function() {
                expect(this.view.$("svg.chart").length).toBe(1);
            });
        });

        it("has a chart container", function() {
            expect(this.view.$("svg.chart")).toExist();
        });

        it("has x and y axes with the right labels", function() {
            expect(this.view.$(".xaxis .axis_label")).toHaveText("hair_length");
            expect(this.view.$(".yaxis .axis_label")).toHaveText("kill_count");
        });

        describe("the bins", function() {
            beforeEach(function() {
                this.bins = this.view.$("rect.bin");
            });

            it("has one box for each combination of bins", function() {
                expect(this.bins.length).toBe(12);
            });

            it("draws bins all the way across the plot", function() {
                var rightXs = _.map(this.bins, rightX);
                var leftXs = _.map(this.bins, leftX);
                var topYs = _.map(this.bins, topY);
                var bottomYs = _.map(this.bins, bottomY);

                expect(_.min(leftXs)).toBeWithinDeltaOf(this.minX, 5);
                expect(_.max(rightXs)).toBeWithinDeltaOf(this.maxX, 5);
                expect(_.min(topYs)).toBeWithinDeltaOf(this.minY, 5);
                expect(_.max(bottomYs)).toBeWithinDeltaOf(this.maxY, 5);
            });

            it("positions the bins next to each other", function() {
                var rows = this.task.get("rows");
                var binsByXAndY = {};

                _.each(rows, function(row, i) {
                    var bin = this.bins.eq(i);
                    var x = row.x,
                        y = row.y;
                    binsByXAndY[x] || (binsByXAndY[x] = {});
                    binsByXAndY[x][y] = bin;
                }, this);

                _.each(rows, function(row, i) {
                    var bin = this.bins.eq(i);
                    var x = row.x,
                        y = row.y;

                    if (x === 1 || y === 1) return;
                    expect(leftX(binsByXAndY[x][y])).toBeWithinDeltaOf(rightX(binsByXAndY[x-1][y]), 2);
                    expect(bottomY(binsByXAndY[x][y])).toBeWithinDeltaOf(topY(binsByXAndY[x][y-1]), 2);
                }, this);
            });

            it("makes bins with greater values darker than those with lesser values", function() {
                var rows = this.task.get("rows");
                expect(rows[1].value).toBeGreaterThan(rows[0].value);
                expect(this.bins[1]).toBeDarkerThan(this.bins[0]);

                expect(rows[10].value).toBeGreaterThan(rows[1].value);
                expect(this.bins[10]).toBeDarkerThan(this.bins[1]);
            });
        });
    });

    context("when some bins have zero width", function() {
        beforeEach(function() {
            this.task = fixtures.heatmapTaskWithResult({
                xAxis: "hair_length",
                yAxis: "kill_count",
                xBins: "4",
                yBins: "3",
                rows: [
                    { yLabel: [71.8, 71.8],     xLabel: [0, 1.8],   value: 39541, y: 1, x: 1 },
                    { yLabel: [71.8, 113.6],  xLabel: [0, 1.8],   value: 39873, y: 2, x: 1 },
                    { yLabel: [113.6, 155.4], xLabel: [0, 1.8],   value: 39993, y: 3, x: 1 },
                    { yLabel: [71.8, 71.8],     xLabel: [1.8, 3.6], value: 39818, y: 1, x: 2 },
                    { yLabel: [71.8, 113.6],  xLabel: [1.8, 3.6], value: 39838, y: 2, x: 2 },
                    { yLabel: [113.6, 155.4], xLabel: [1.8, 3.6], value: 39911, y: 3, x: 2 },
                    { yLabel: [71.8, 71.8],     xLabel: [3.6, 5.4], value: 39631, y: 1, x: 3 },
                    { yLabel: [71.8, 113.6],  xLabel: [3.6, 5.4], value: 40174, y: 2, x: 3 },
                    { yLabel: [113.6, 155.4], xLabel: [3.6, 5.4], value: 39700, y: 3, x: 3 },
                    { yLabel: [71.8, 71.8],     xLabel: [5.4, 5.4], value: 40551, y: 1, x: 4 },
                    { yLabel: [71.8, 113.6],  xLabel: [5.4, 5.4], value: 40411, y: 2, x: 4 },
                    { yLabel: [113.6, 155.4], xLabel: [5.4, 5.4], value: 39841, y: 3, x: 4 },
                ]
            });

            this.view = new chorus.views.visualizations.Heatmap({ model: this.task });
            $("#jasmine_content").append(this.view.el);
            this.view.render();
        });

        it("does not create any rectangles with negative width", function() {
            this.bins = this.view.$("rect.bin");
            this.bins.each(function() {
                expect($(this).attr("width")).toBeGreaterThanOrEqualTo(0);
                expect($(this).attr("height")).toBeGreaterThanOrEqualTo(0);
            });
        });
    });

    function relativeLightness(color) {
        return color.r + color.g + color.b;
    }
});


