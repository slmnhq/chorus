describe("chorus.models.ImportTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.ImportTask();
    });

    it("has the taskType set to runEdcImportWork", function() {
        expect(this.model.get('taskType')).toBe("runEdcImportWork");
    })

    it("has the sourceType set to dataset", function() {
        expect(this.model.get('sourceType')).toBe("dataset");
    })
});
