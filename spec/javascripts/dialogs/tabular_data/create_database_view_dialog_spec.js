describe("chorus.dialogs.CreateDatabaseView", function() {
    beforeEach(function () {
        this.dataset = fixtures.chorusView();
        this.launchElement = $("<a data-dialog='CreateDatabaseView'></a>")
        this.launchElement.data("workspace", fixtures.workspace());
        this.view = new chorus.dialogs.CreateDatabaseView({
            launchElement: this.launchElement,
            pageModel: this.dataset
        });
        this.view.render();
    });

    it("should have the correct title", function() {
        expect(this.view.$("h1")).toContainTranslation("create_database_view.title");
    });

    it('should have a close link', function () {
        var $cancelButton = this.view.$('.modal_controls .cancel')
        expect($cancelButton).toContainTranslation("actions.cancel");
    });

    it("should have a submit button that starts out disabled", function() {
        expect(this.view.$("button.submit")).toContainTranslation("create_database_view.submit");
    });

    it("shows the target schema", function() {
        expect(this.view.$(".target_location")).toContainTranslation("create_database_view.target");
        expect(this.view.$(".target_location .target_location_value")).toContainText(this.launchElement.data("workspace").sandbox().schema().canonicalName());
    });

    it("has an input for the name", function() {
        expect(this.view.$("label[for=create_database_view_name]")).toContainTranslation("create_database_view.name");
        expect(this.view.$("input#create_database_view_name")).toExist();
    });

    describe("input", function() {
        describe("invalid input", function() {
            beforeEach(function() {
                this.view.$("input#create_database_view_name").val("0123");
                this.view.$("button.submit").click();
            });

            it("rejects names that don't match the ChorusIdentifier64 rules", function() {
                expect(this.view.$("input#create_database_view_name")).toHaveClass("has_error");
            });

            itAcceptsValidInput();
        });

        itAcceptsValidInput();

        function itAcceptsValidInput() {
            it("accepts names that match the ChorusIdentifier64 rules", function() {
                this.view.$("input#create_database_view_name").val("a_name");
                this.view.$("button.submit").click();
                expect(this.view.$("input#create_database_view_name")).not.toHaveClass("has_error");
                expect(this.view.$("button.submit").isLoading()).toBeTruthy();
                expect(this.view.$("button.submit")).toContainTranslation("actions.creating");
            });
        }
    });
});