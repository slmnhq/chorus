describe("chorus.dialogs.TabularDataPreview", function () {
    beforeEach(function () {
        this.dataset = fixtures.datasetSandboxTable();
        this.launchElement = $("<a data-dialog='TabularDataPreview'></a>")
        spyOn(chorus.views.ResultsConsole.prototype, 'execute').andCallThrough();
        spyOn(chorus.dialogs.TabularDataPreview.prototype, "closeModal");
        this.view = new chorus.dialogs.TabularDataPreview({
            launchElement: this.launchElement,
            pageModel: this.dataset
        });
        this.view.render();
        $('#jasmine_content').append(this.view.el);
    });

    it('should have a close link', function () {
        expect(this.view.$('.modal_controls .cancel')).toContainTranslation("actions.close_window");
    });

    it("should pass the dataset to execute on the results console", function () {
        expect(this.view.resultsConsole.execute).toHaveBeenCalledWith(this.dataset.preview());
        expect(this.view.resultsConsole.el).toBe(this.view.$('.results_console').get(0));
    });

    it("puts the objectName in the title", function() {
        expect(this.view.$('.dialog_header h1')).toContainTranslation('dataset.data_preview_title', {name: this.dataset.get('objectName')});
    });

    describe("event handling", function() {
        describe("action:closePreview", function() {
            beforeEach(function() {
                this.view.$(".cancel").click();
            });

            it("dismisses the dialog", function() {
                expect(this.view.closeModal).toHaveBeenCalled();
            });
        });
    });
});