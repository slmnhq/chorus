describe("chorus.dialogs.SqlPreview", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.launchElement = $("<a></a>");
            this.dialog = new chorus.dialogs.SqlPreview({launchElement: this.launchElement});
            this.dialog.render();
        });

        it("has a close window button", function() {
            expect(this.dialog.$('.modal_controls button.cancel')).toExist();
            expect(this.dialog.$('.modal_controls button.cancel').text().trim()).toMatchTranslation("actions.close_window");
        });

        describe("generated sql", function() {
            beforeEach(function() {
                this.parent = {
                    sql : function(){ return "select awesome from sql"; }
                }

                this.launchElement.data("parent", this.parent);
            });

            it("constructs the SQL correctly", function() {
                expect(this.dialog.additionalContext().sql).toBe("select awesome from sql");
            });
        })
    });
});