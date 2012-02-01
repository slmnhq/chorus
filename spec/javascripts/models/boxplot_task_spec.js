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

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("boxplot");
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

        it("renames the 'xAxis' and 'yAxis' fields to 'chart[xAxis]' and 'chart[yAxis]' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[xAxis]']).toBe("age");
            expect(request.params()['chart[yAxis]']).toBe("height");
        });
    });
})
