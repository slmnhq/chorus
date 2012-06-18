describe("chorus.models.DatabaseObjectStatistics", function() {
    describe("#url", function() {
        beforeEach(function() {
            this.databaseObjectStatistics = new chorus.models.DatabaseObjectStatistics({ datasetId: 1 });
        });

        it("should call the right API", function() {
            expect(this.databaseObjectStatistics.url()).toMatchUrl("/datasets/1/statistics")
        });
    });
});