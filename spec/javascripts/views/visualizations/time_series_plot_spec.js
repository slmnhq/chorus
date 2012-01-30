describe("chorus.views.visualizations.TimeSeriesPlot", function() {
    beforeEach(function() {
        this.task = new chorus.models.Task({
            result: {
                columns: [{ name: "age" }, { name: "weight" }, { name: "animal" }],
                rows: [
                    { age: 1, weight:  5, animal: "aardvark" },
                    { age: 2, weight:  10, animal: "aardvark" },
                    { age: 3, weight:  12, animal: "aardvark" },
                    { age: 9, weight:  45, animal: "aardvark" },
                    { age: 10, weight: 40, animal: "aardvark" },
                    { age: 11, weight: 48, animal: "aardvark" },
                    { age: 14, weight: 42, animal: "aardvark" },
                    { age: 20, weight: 20, animal: "aardvark" }
                ]
            }
        });

        this.view = new chorus.views.visualizations.TimeSeriesPlot({
            model: this.task,
            x: "age",
            y: "weight"
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders a single path representing the data", function() {
            expect(this.view.$("path").length).toBe(1);
        });

        it("includes every point in the dataset on the path", function() {
            // L is used in the path string to indicate a line segment;
            // there should be (data.length -1) line segments.
            var pathString = this.view.$("path").attr("d");
            expect(pathString.match(/L/g).length).toBe(7);
            expect(this.view.model.get("result").rows.length).toBe(8);
        });

        // d3 does not guarantee the number of ticks;
        // it computes them based on what it deems appropriate
        //
        // https://github.com/mbostock/d3/wiki/Quantitative-Scales#wiki-linear_ticks
        it("renders xtick lines by default", function() {
            expect(this.view.$("line.xtick").length).toBeGreaterThan(1);
        });

        it("renders ytick lines by default", function() {
            expect(this.view.$("line.ytick").length).toBeGreaterThan(1);
        });
    });
});
