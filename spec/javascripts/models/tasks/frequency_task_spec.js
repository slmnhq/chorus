describe("chorus.models.FrequencyTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.FrequencyTask({
            bins: 23,
            yAxis: "height",
            tabularData: newFixtures.dataset.sandboxTable({objectName: "users"})
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

        it("renames the 'yAxis' field required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart_task[y_axis]']).toBe("height");
        });

        it("renames the 'bins' field as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart_task[bins]']).toBe("23");
        })
    });
})
