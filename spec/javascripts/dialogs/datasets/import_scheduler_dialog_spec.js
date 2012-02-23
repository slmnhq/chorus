describe("chorus.dialogs.ImportScheduler", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable();
        this.launchElement = $("<a/>");
        this.launchElement.data("dataset", this.dataset);
        this.dialog = new chorus.dialogs.ImportScheduler({launchElement : this.launchElement});
        this.dialog.render();
    });

    it("should have the correct title", function() {
        expect(this.dialog.title).toMatchTranslation("import_now.title");
    });

    it("should display the import destination", function() {
        expect(this.dialog.$(".destination")).toContainTranslation("import_now.destination", {canonicalName: this.dataset.schema().canonicalName()})
    })

    it("should have a 'Begin Import' button", function() {
        expect(this.dialog.$("button.submit")).toContainTranslation("import_now.begin");
        expect(this.dialog.$("button.submit")).toBeDisabled();
    });

    it("should have an import into new table radio button", function() {
        expect(this.dialog.$(".new_table label")).toContainTranslation("import_now.new_table");
    });

    it("should have an import into existing table radio button", function() {
        expect(this.dialog.$(".existing_table label")).toContainTranslation("import_now.existing_table");
    });

    it("should have a text entry for new table name", function() {
        expect(this.dialog.$(".new_table .name")).toExist();
        expect(this.dialog.$(".new_table .name")).toBeEnabled();
    });

    it("should have a dropdown selector for existing tables", function() {
        expect(this.dialog.$(".existing_table .names")).toExist();
        expect(this.dialog.$(".existing_table .names")).toBeDisabled();
    });

    context("when 'Import into Existing Table' is checked", function() {
        beforeEach(function() {
            this.dialog.$(".new_table input:radio").prop("checked", false);
            this.dialog.$(".existing_table input:radio").prop("checked", true).change();
        });

        it("should disable the 'New Table' text field", function() {
            expect(this.dialog.$(".new_table .name")).toBeDisabled();
            expect(this.dialog.$(".existing_table .names")).toBeEnabled();
        });

        context("when 'Import into New Table' is checked", function() {
            beforeEach(function() {
                this.dialog.$(".new_table input:radio").prop("checked", true).change();
                this.dialog.$(".existing_table input:radio").prop("checked", false).change();
            });

            it("should disable the 'Existing Table' dropdown", function() {
                expect(this.dialog.$(".new_table .name")).toBeEnabled();
                expect(this.dialog.$(".existing_table .names")).toBeDisabled();
            });

        });
    });
});