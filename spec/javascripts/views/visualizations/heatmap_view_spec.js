describe("chorus.views.visualizations.Heatmap", function() {
    beforeEach(function() {
        this.task = fixtures.heatmapTaskWithResult({
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
            ],
        });

        this.view = new chorus.views.visualizations.Heatmap({ model: this.task });
    });

    xdescribe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("has a chart container", function() {
            expect(this.view.$("svg.chart")).toExist();
        });

        it("has one box for each combination of bins", function() {
            expect(this.view.$("rect").length).toBe(12);
        });
    });
});


