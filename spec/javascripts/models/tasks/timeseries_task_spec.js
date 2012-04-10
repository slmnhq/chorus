describe("chorus.models.TimeseriesTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.TimeseriesTask({
            xAxis: "age",
            yAxis: "height",
            timeInterval: 'minute',
            aggregation: 'sum',
            tabularData: newFixtures.datasetSandboxTable({objectName: "users"})
        });
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("timeseries");
    });

    describe("column label translations", function() {
        it("provides translations for the column labels", function() {
            expect(this.model.getColumnLabel("time")).toMatchTranslation("dataset.visualization.timeseries.time");
            expect(this.model.getColumnLabel("value")).toMatchTranslation("dataset.visualization.timeseries.value");
        });

        it("provides reasonable defaults for missing keys", function() {
            expect(this.model.getColumnLabel("foo")).toBe("foo");
        });
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'xAxis', 'yAxis', 'aggregation', and 'timeInterval' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[xAxis]']).toBe("age");
            expect(request.params()['chart[yAxis]']).toBe("height");
            expect(request.params()['chart[aggregation]']).toBe("sum");
            expect(request.params()['chart[timeInterval]']).toBe("minute");
        });
    });
})
