describe("chorus.models.DatasetStatistics", function() {
    describe("#url", function() {
        beforeEach(function() {
            this.datasetStatistics = new chorus.models.DatasetStatistics({ datasetId: 1 });
        });

        it("should call the right API", function() {
            expect(this.datasetStatistics.url()).toMatchUrl("/datasets/1/statistics")
        });
    });
});
