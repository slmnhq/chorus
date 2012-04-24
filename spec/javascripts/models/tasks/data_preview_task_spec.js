describe("chorus.models.DataPreviewTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.DataPreviewTask();
    });

    it("has the right task type", function() {
       expect(this.model.get("taskType")).toBe("previewTableOrView");
    })

    it("uses the objectName as its 'name'", function() {
        this.model.set({ objectName: "mike_the_table" });
        expect(this.model.name()).toBe("mike_the_table");
    });
});
