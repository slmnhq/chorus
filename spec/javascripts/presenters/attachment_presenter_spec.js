describe("chorus.presenters.Attachment", function() {
    context("given a model with its own page", function() {
        it("includes the model's show url", function() {
            var model = rspecFixtures.workfile.text();
            expect(model.hasOwnPage()).toBeTruthy();
            var presenter = new chorus.presenters.Attachment(model);
            expect(presenter.url()).toBe(model.showUrl());
        });
    });

    context("given a model without its own page", function() {
        it("includes the model's download url", function() {
            var model = fixtures.attachment();
            spyOn(model, "hasOwnPage").andReturn(false);
            var presenter = new chorus.presenters.Attachment(model);
            expect(presenter.url()).toBe(model.downloadUrl());
        });
    });

    describe("name", function() {
        it("uses objectName if available", function() {
            var model = newFixtures.workspaceDataset.sandboxTable();
            var presenter = new chorus.presenters.Attachment(model);
            expect(presenter.name()).toBe(model.get('objectName'));
        });

        it("uses name if available", function() {
            var model = new chorus.models.Attachment({name: "attachment name"});
            var presenter = new chorus.presenters.Attachment(model);
            expect(presenter.name()).toBe(model.get('name'));
        });

        it("uses nothing otherwise", function() {
            var model = rspecFixtures.workfile.text();
            var presenter = new chorus.presenters.Attachment(model);
            expect(presenter.name()).toBeUndefined();
        });
    });

    describe("iconSrc", function() {
        context("when the model is an image", function() {
            beforeEach(function() {
                this.model = fixtures.attachment({type: "IMAGE"});
            });

            it("uses the thumbnail url", function() {
                var presenter = new chorus.presenters.Attachment(this.model);
                expect(presenter.iconSrc()).toBe(this.model.iconUrl({size: "medium"}));
            });
        });

        context("when the model is not an image", function() {
            beforeEach(function() {
                this.model = fixtures.attachment({type: "OTHER"});
            });

            it("uses the icon url", function() {
                var presenter = new chorus.presenters.Attachment(this.model);
                expect(presenter.iconSrc()).toBe(this.model.iconUrl({size: "medium"}));
            });
        });
    });
});
