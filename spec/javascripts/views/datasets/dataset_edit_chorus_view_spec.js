describe("chorus.views.DatasetEditChorusView", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.DatasetEditChorusView({ model: this.dataset });
    });
})