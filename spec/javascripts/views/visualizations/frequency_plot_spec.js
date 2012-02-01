describe("chorus.views.visualizations.FrequencyPlot", function() {
    beforeEach(function() {
        this.model = new chorus.models.SqlExecutionTask({
            result: {
                columns: [{ name: "id" }, { name: "value" }, { name: "animal" }],
                rows: [
                    { id: 1, value: 1, animal:  "aardvark" },
                    { id: 2, value: 2, animal: "aardvark" },
                    { id: 3, value: 3, animal: "aardvark" },
                    { id: 4, value: 4, animal: "aardvark" },
                    { id: 5, value: 100, animal: "beluga" },
                    { id: 6, value: 200, animal: "beluga" },
                    { id: 7, value: 300, animal: "beluga" },
                    { id: 8, value: 400, animal: "beluga" },
                    { id: 9, value: 10, animal: "chupacabra" },
                    { id: 10, value: 20, animal: "chupacabra" },
                    { id: 11, value: 30, animal: "chupacabra" }
                ]
            }
        });

        this.view = new chorus.views.visualizations.FrequencyPlot({
            model: this.task,
            column: "animal"
        });
    });

    xdescribe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders a bar for each category", function() {
        });

        specify("the chupacabra column is shorter than the beluga column", function() {
        });


        // d3 does not guarantee the number of ticks;
        // it computes them based on what it deems appropriate
        //
        // https://github.com/mbostock/d3/wiki/Quantitative-Scales#wiki-linear_ticks
        it("renders xtick lines by default", function() {
            expect(this.view.$("line.xtick").length).toBeGreaterThan(1);
        });
    });
});
