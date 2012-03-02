describe("chorus.models.FrequencyTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.FrequencyTask({
            bins: 23,
            yAxis: "height",
            tabularData: fixtures.datasetSandboxTable({objectName: "users"})
        });
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("chart[type]")).toBe("frequency");
    });

    describe("column label translations", function() {
        it("provides translations for the column labels", function() {
            expect(this.model.getColumnLabel("bucket")).toMatchTranslation("dataset.visualization.frequency.bucket");
            expect(this.model.getColumnLabel("count")).toMatchTranslation("dataset.visualization.frequency.count");
        });

        it("provides reasonable defaults for missing keys", function() {
            expect(this.model.getColumnLabel("foo")).toBe("foo");
        });
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'yAxis' field to 'chart[yAxis]' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[yAxis]']).toBe("height");
        });

        it("renames the 'bins' field to 'chart[bins]' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[bins]']).toBe("23");
        })
    });
})
