describe("chorus.dialogs.DatasetImport", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.DatasetImport();
        this.dialog.render();
    });

    it("doesn't crash", function() {
        expect(true).toBe(true);
    });
});
