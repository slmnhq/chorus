describe("chorus.models.HeatmapTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.HeatmapTask({
            xAxis: "age",
            yAxis: "height",
            xBins: 5,
            yBins: 6,
            objectName: "users",
            sandboxId: '4',
            workspaceId: '5'
        });
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("heatmap");
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'xAxis', 'yAxis', 'xBins' and 'yBins' fields as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[xAxis]']).toBe("age");
            expect(request.params()['chart[yAxis]']).toBe("height");
            expect(request.params()['chart[xBins]']).toBe('5');
            expect(request.params()['chart[yBins]']).toBe('6');
        });
    });
})

