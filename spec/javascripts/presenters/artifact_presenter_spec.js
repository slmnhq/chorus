describe("chorus.presenters.Artifact", function() {
    context("given an image or text workfile", function() {
        it("includes the workfile's show url", function() {
            var model = fixtures.workfile({ mimeType: "text/plain" });
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.showUrl());
        });
    });

    context("given a workfile that is NOT an image or text", function() {
        it("includes the workfile's download url", function() {
            var model = fixtures.workfile({ mimeType: "application/octet-stream" });
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.downloadUrl());
        })
    });

    context("given an artifact that is NOT a workfile", function() {
        it("includes a download url for the artifact", function() {
            var model = fixtures.artifact();
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.downloadUrl());
        });
    });
});