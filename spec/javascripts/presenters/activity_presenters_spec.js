describe("chorus.presenters.Activity", function() {
    var model, actor, presenter;

    context("instance created", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.instanceCreated({
                actor: { firstName: "bomb", lastName: "cherry"},
                target: { name: "kaboom" }
            });

            presenter = new chorus.presenters.Activity(model);
            instance = model.target();
            actor = model.actor();
        });

        it("includes the relative timestamp", function() {
            var relativeTime = chorus.helpers.relativeTimestamp(model.get("timestamp"));
            expect(presenter.timestamp()).toBe(relativeTime);
        });

        describe("data for the icon", function() {
            it("shows the user's icon", function() {
                expect(presenter.iconSrc()).toBe(actor.fetchImageUrl({ size: "icon" }));
            });

            it("links to the user's profile", function() {
                expect(presenter.iconHref()).toBe(actor.showUrl());
            });

            it("has the class 'profile'", function() {
                expect(presenter.iconClass()).toBe("profile");
            });
        });

        describe("#headerHtml", function() {
            var headerHtml;

            beforeEach(function() {
                headerHtml = presenter.headerHtml();
            });

            it("returns a handlebars safe-string (so that html won't be stripped)", function() {
                expect(headerHtml).toBeA(Handlebars.SafeString);
            });

            it("has the right content", function() {
                expect(headerHtml.toString()).toContainTranslation("activity.header.INSTANCE_CREATED.without_workspace", {
                    authorLink: chorus.helpers.linkTo(actor.showUrl(), actor.name()),
                    objectLink: chorus.helpers.linkTo(instance.showUrl(), instance.name())
                });
            });
        });
    });
});


