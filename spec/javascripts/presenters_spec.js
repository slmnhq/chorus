describe("chorus.presenters.Base", function() {
    it("stores the given model and options hash", function() {
        var model = new chorus.models.Base();
        var options = { anOption: true };
        var presenter = new chorus.presenters.Base(model, options);
        expect(presenter.model).toBe(model);
        expect(presenter.options).toBe(options);
    });
});
