describe("chorus.models.ChorusViewPreviewTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.ChorusViewPreviewTask({ datasetId: 45 });
    });

    it("has the right task url", function() {
       expect(this.model.url()).toBe("/datasets/45/previews");
    })

    context("when the task has an 'objectName'", function() {
        it("uses that as its 'name'", function() {
            this.model.set({ objectName: "mike_the_table" });
            expect(this.model.name()).toBe("mike_the_table");
        });
    });

    context("when the task is from a newly-created chorus view, and doesn't have an object name", function() {
        it("has a default name", function() {
            expect(this.model.name()).toMatchTranslation("dataset.sql.filename");
        });
    });
});
