describe("chorus.models.BoxplotTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.BoxplotTask({
            xAxis: "age",
            yAxis: "height",
            objectName: "users",
            sandboxId: '4',
            workspaceId: '5'
        });
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("boxplot");
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'xAxis' and 'yAxis' fields to 'chart[xAxis]' and 'chart[yAxis]' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[xAxis]']).toBe("age");
            expect(request.params()['chart[yAxis]']).toBe("height");
        });
    });
})
