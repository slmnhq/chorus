describe("chorus.models.BoxplotTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.BoxplotTask({
            xAxis: "age",
            yAxis: "height",
            bins: "56",
            tabularData: newFixtures.dataset.sandboxTable({objectName: "users"})
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
            expect(this.model.getColumnLabel("min")).toMatchTranslation("dataset.visualization.boxplot.minimum");
            expect(this.model.getColumnLabel("median")).toMatchTranslation("dataset.visualization.boxplot.median");
            expect(this.model.getColumnLabel("max")).toMatchTranslation("dataset.visualization.boxplot.maximum");
            expect(this.model.getColumnLabel("percentage")).toMatchTranslation("dataset.visualization.boxplot.percentage");
            expect(this.model.getColumnLabel("firstQuartile")).toMatchTranslation("dataset.visualization.boxplot.1stquartile");
            expect(this.model.getColumnLabel("thirdQuartile")).toMatchTranslation("dataset.visualization.boxplot.3rdquartile");
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
            expect(request.params()['chart[x_axis]']).toBe("age");
            expect(request.params()['chart[y_axis]']).toBe("height");
        });

        it("renames the 'bins' field to 'chart[bins]' as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.params()['chart[bins]']).toBe("56");
        })
    });

    describe("#getSortedRows", function() {
        beforeEach(function() {
            this.rows = [ { percentage: '5%'}, { percentage : '3.2%'} , { percentage : '3.3%'}];
            this.sortedRows = [ { percentage: '5%'}, { percentage : '3.3%'} , { percentage : '3.2%'}];
        });
        it("should sort them descending order by percentage", function() {
            expect(this.model.getSortedRows(this.rows)).toEqual(this.sortedRows);
        })
    });
})
