describe("chorus.views.visualizations.Histogram", function() {
    beforeEach(function() {
        this.task = new chorus.models.HistogramTask({
            columns: [
                {name : "bin", typeCategory: "STRING"},
                {name : "frequency", typeCategory: "WHOLE_NUMBER"}
            ],

            rows: [
                { bin: "0-9", frequency: 5 },
                { bin: "10-19", frequency: 8 },
                { bin: "20-29", frequency: 0 },
                { bin: "30-39", frequency: 1 },
                { bin: "40-49", frequency: 2000 }
            ]
        });
        this.foo = "bar"
        this.view = new chorus.views.visualizations.HistogramPlot({
            model: this.task
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("doesn't crash and creates svg node", function() {
            expect(this.view.$('svg')).toExist();
        })

        it("has one bar for each bin", function() {
            expect(this.view.$(".bar").length).toBe(5);
        })

        it("renders no xtick lines by default", function() {
            expect(this.view.$("line.xtick").length).toBe(0);
        });

        it("renders ytick lines by default", function() {
            expect(this.view.$("line.ytick").length).toBeGreaterThan(1);
        });

        // TODO: bar heights, widths, location x&y, labels x&y, axis line x&y

    });
});

