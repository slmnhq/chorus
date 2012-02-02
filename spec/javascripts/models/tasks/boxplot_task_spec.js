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

    describe("column label translations", function() {
        it("provides translations for the column labels", function() {
            expect(this.model.getColumnLabel("bucket")).toMatchTranslation("dataset.visualization.boxplot.bucket");
            expect(this.model.getColumnLabel("minimum")).toMatchTranslation("dataset.visualization.boxplot.minimum");
            expect(this.model.getColumnLabel("median")).toMatchTranslation("dataset.visualization.boxplot.median");
            expect(this.model.getColumnLabel("maximum")).toMatchTranslation("dataset.visualization.boxplot.maximum");
            expect(this.model.getColumnLabel("percentage")).toMatchTranslation("dataset.visualization.boxplot.percentage");
            expect(this.model.getColumnLabel("1stquartile")).toMatchTranslation("dataset.visualization.boxplot.1stquartile");
            expect(this.model.getColumnLabel("3rdquartile")).toMatchTranslation("dataset.visualization.boxplot.3rdquartile");
        });

        it("provides reasonable defaults for missing keys", function() {
            expect(this.model.getColumnLabel("foo")).toBe("foo");
        });
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
