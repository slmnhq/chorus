describe("chorus.models.HistogramTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.HistogramTask({
            bins: 5,
            xAxis: "height",
            tabularData: fixtures.datasetSandboxTable({objectName: "users"})
        });
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("histogram");
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'xAxis' and 'bins' fields as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[xAxis]']).toBe("height");
            expect(request.params()['chart[bins]']).toBe('5');
        });
    });
})

