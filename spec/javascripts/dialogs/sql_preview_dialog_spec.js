describe("chorus.dialogs.SqlPreview", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.SqlPreview();
            this.dialog.render();
        });

       it("has a close window button", function() {
           expect(this.dialog.$('.modal_controls button.cancel')).toExist();
           expect(this.dialog.$('.modal_controls button.cancel').text().trim()).toMatchTranslation("actions.close_window");
       });
    });
});