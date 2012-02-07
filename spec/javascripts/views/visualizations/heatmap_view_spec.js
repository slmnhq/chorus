describe("chorus.views.visualizations.Heatmap", function() {
    var leftX = chorus.svgHelpers.leftX,
        rightX = chorus.svgHelpers.rightX,
        width = chorus.svgHelpers.width,
        height = chorus.svgHelpers.height,
        centerX = chorus.svgHelpers.centerX,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY;

    beforeEach(function() {
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
                { yLabel: "[30-71.8]",     xLabel: "[0-1.8]",   value: 39541, y: 1, x: 1 },
                { yLabel: "[71.8-113.6]",  xLabel: "[0-1.8]",   value: 39873, y: 2, x: 1 },
                { yLabel: "[113.6-155.4]", xLabel: "[0-1.8]",   value: 39993, y: 3, x: 1 },
                { yLabel: "[30-71.8]",     xLabel: "[1.8-3.6]", value: 39818, y: 1, x: 2 },
                { yLabel: "[71.8-113.6]",  xLabel: "[1.8-3.6]", value: 39838, y: 2, x: 2 },
                { yLabel: "[113.6-155.4]", xLabel: "[1.8-3.6]", value: 39911, y: 3, x: 2 },
                { yLabel: "[30-71.8]",     xLabel: "[3.6-5.4]", value: 39631, y: 1, x: 3 },
                { yLabel: "[71.8-113.6]",  xLabel: "[3.6-5.4]", value: 40174, y: 2, x: 3 },
                { yLabel: "[113.6-155.4]", xLabel: "[3.6-5.4]", value: 39700, y: 3, x: 3 },
                { yLabel: "[30-71.8]",     xLabel: "[5.4-7.2]", value: 40551, y: 1, x: 4 },
                { yLabel: "[71.8-113.6]",  xLabel: "[5.4-7.2]", value: 40411, y: 2, x: 4 },
                { yLabel: "[113.6-155.4]", xLabel: "[5.4-7.2]", value: 39841, y: 3, x: 4 },
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

            this.minX = this.view.axes.scales().x.rangeExtent()[0];
            this.maxX = this.view.axes.scales().x.rangeExtent()[1];
            this.minY = this.view.axes.scales().y.rangeExtent()[1];
            this.maxY = this.view.axes.scales().y.rangeExtent()[0];
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

            it("divides the space of the plot evenly between the bins", function() {
                var contentWidth = this.maxX - this.minX;
                var contentHeight = this.maxY - this.minY;

                var widths  = _.map(this.bins, function(bin) { return width(bin); });
                var heights = _.map(this.bins, function(bin) { return height(bin); });

                expect(widths).toAllBeEqual();
                expect(heights).toAllBeEqual();
            });

            it("positions the bins correctly", function() {
                var binWidth = width(this.bins[0]);
                var binHeight = height(this.bins[0]);

                _.each(this.bins, function(bin, i) {
                    var row = this.task.get('rows')[i]
                    var x = row.x - 1
                    var y = row.y - 1
                    expect(leftX(bin)).toBeCloseTo(this.minX + x * binWidth, 1)
                    expect(bottomY(bin)).toBeCloseTo(this.maxY - y * binHeight, 1)
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

    function relativeLightness(color) {
        return color.r + color.g + color.b;
    }
});


