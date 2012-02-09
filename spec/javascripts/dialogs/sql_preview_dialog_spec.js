describe("chorus.dialogs.SqlPreview", function() {
    describe("#render", function() {
        beforeEach(function() {
            var launchElement = $("<a></a>");
            this.dialog = new chorus.dialogs.SqlPreview({launchElement: launchElement});
            this.dialog.render();
        });

       it("has a close window button", function() {
           expect(this.dialog.$('.modal_controls button.cancel')).toExist();
           expect(this.dialog.$('.modal_controls button.cancel').text().trim()).toMatchTranslation("actions.close_window");
       });
    });
});