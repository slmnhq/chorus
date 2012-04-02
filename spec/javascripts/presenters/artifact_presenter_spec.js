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
            var model = fixtures.artifact();
            spyOn(model, "hasOwnPage").andReturn(false);
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.url).toBe(model.downloadUrl());
        });
    });

    describe("name", function() {
        it("uses objectName if available", function() {
            var model = fixtures.datasetSandboxTable();
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.name).toBe(model.get('objectName'));
        })

        it("uses nothing otherwise", function() {
            var model = fixtures.workfile();
            var presenter = new chorus.presenters.Artifact(model);
            expect(presenter.name).toBeUndefined();
        })
    })

    describe("iconSrc", function() {
        context("when the model is an image", function() {
            beforeEach(function() {
                this.model = fixtures.artifact({type: "IMAGE"});
            });

            it("uses the thumbnail url", function() {
                var presenter = new chorus.presenters.Artifact(this.model);
                expect(presenter.iconSrc).toBe(this.model.thumbnailUrl());
            });
        });

        context("when the model is not an image", function() {
            beforeEach(function() {
                this.model = fixtures.artifact({type: "OTHER"});
            });

            it("uses the icon url", function() {
                var presenter = new chorus.presenters.Artifact(this.model);
                expect(presenter.iconSrc).toBe(this.model.iconUrl({size: "medium"}));
            });
        });
    });
});