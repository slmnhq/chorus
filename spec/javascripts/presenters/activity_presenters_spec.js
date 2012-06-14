describe("chorus.presenters.Activity", function() {
    var model, actor, presenter;

    context("common aspects", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.instanceCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.getModel("actor");
        });

        it("includes the relative timestamp", function() {
            var relativeTime = chorus.helpers.relativeTimestamp(model.get("timestamp"));
            expect(presenter.timestamp()).toBe(relativeTime);
        });

        describe("#headerHtml", function() {
            it("returns a handlebars safe-string (so that html won't be stripped)", function() {
                expect(presenter.headerHtml()).toBeA(Handlebars.SafeString);
            });
        });
    });

    context("instance created", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.instanceCreated();
            presenter = new chorus.presenters.Activity(model);
            instance = model.getModel("instance");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.INSTANCE_CREATED.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    instanceLink: linkTo(instance.showUrl(), instance.name())
                }
            );
        });
    });

    context("instance changed owner", function() {
        var instance, newOwner;

        beforeEach(function() {
            model = rspecFixtures.activity.instanceChangedOwner();
            presenter = new chorus.presenters.Activity(model);
            instance = model.getModel("instance");
            newOwner = model.getModel("newOwner");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.INSTANCE_CHANGED_OWNER.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    instanceLink: linkTo(instance.showUrl(), instance.name()),
                    newOwnerLink: linkTo(newOwner.showUrl(), newOwner.name())
                }
            );
        });
    });

    function linkTo(url, text) {
        return chorus.helpers.linkTo(url, text);
    }

    function itHasTheActorIcon() {
        describe("the icon", function() {
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
    }
});


