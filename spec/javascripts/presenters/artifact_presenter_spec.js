describe("chorus.presenters.Artifact", function() {
    context("given a model with its own page", function() {
        it("includes the model's show url", function() {
            var model = fixtures.workfile({ mimeType: "text/plain" });
            expect(model.hasOwnPage()).toBeTruthy();
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.showUrl());
        });
    });

    context("given a model without its own page", function() {
        it("includes the model's download url", function() {
            var model = fixtures.workfile({ mimeType: "application/octet-stream" });
            expect(model.hasOwnPage()).toBeFalsy();
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.downloadUrl());
        });
    });
});