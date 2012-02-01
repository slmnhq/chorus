describe("chorus.models.HistogramTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.HistogramTask({
            bins: 5,
            yAxis: "height",
            objectName: "users",
            sandboxId: '4',
            workspaceId: '5'
        });
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("histogram");
    });

    it("has the rigth task type parameter", function() {
        expect(this.model.get("taskType")).toBe("getChartData");
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/edc/task/sync/");
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("generates the 'relation' field based on the table name", function() {
            var request = this.server.lastCreate();
            expect(request.params().relation).toBe("SELECT * FROM users");
        });
    });
})

