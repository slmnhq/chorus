describe("chorus.dialogs.DatasetImport", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.DatasetImport();
        this.dialog.render();
    });

    it("has the right title", function() {
        expect(this.dialog.$(".dialog_header h1").text()).toMatchTranslation("dataset.import");
    });
});
