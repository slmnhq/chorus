describe("chorus.dialogs.TabularDataPreview", function () {
    beforeEach(function () {
        this.dataset = fixtures.datasetSandboxTable();
        spyOn(chorus.views.ResultsConsole.prototype, 'execute').andCallThrough();
        spyOn(chorus.dialogs.TabularDataPreview.prototype, "closeModal");
        this.view = new chorus.dialogs.TabularDataPreview({
            pageModel: this.dataset
        });
        this.view.render();
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
        beforeEach(function() {
            spyOn(this.view.task, "cancel");
        });

        describe("action:closePreview", function() {
            beforeEach(function() {
                this.view.$("button.cancel").click();
            });

            it("dismisses the dialog", function() {
                expect(this.view.closeModal).toHaveBeenCalled();
            });

            it("cancels the task", function() {
                expect(this.view.task.cancel).toHaveBeenCalled()
            });
        });

        describe("closing the window any other way", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("modal:closed");
            });

            it("cancels the task", function() {
                expect(this.view.task.cancel).toHaveBeenCalled();
            });
        });
    });
});