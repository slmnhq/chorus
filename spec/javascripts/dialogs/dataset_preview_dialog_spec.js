describe("chorus.dialogs.DatasetPreview", function () {
    beforeEach(function () {
        this.dataset = fixtures.datasetSandboxTable();
        this.launchElement = $("<a data-dialog='DatasetPreview'></a>")
        spyOn(chorus.views.ResultsConsole.prototype, 'execute').andCallThrough();
        this.view = new chorus.dialogs.DatasetPreview({
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

});