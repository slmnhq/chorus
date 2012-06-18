describe("chorus.presenters.Activity", function() {
    var model, actor, presenter;

    context("common aspects", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.greenplumInstanceCreated();
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

    context("greenplum instance created", function() {
        var greenplumInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.greenplumInstanceCreated();
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.getModel("greenplumInstance");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CREATED.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    greenplumInstanceLink: linkTo(greenplumInstance.showUrl(), greenplumInstance.name())
                }
            );
        });
    });

    context("hadoop instance created", function() {
        var hadoopInstance

        beforeEach(function() {
            model = rspecFixtures.activity.hadoopInstanceCreated();
            presenter = new chorus.presenters.Activity(model);
            hadoopInstance = model.getModel("hadoopInstance");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.HADOOP_INSTANCE_CREATED.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    hadoopInstanceLink: linkTo(hadoopInstance.showUrl(), hadoopInstance.name())
                }
            );
        });
    });

    context("greenplum instance changed owner", function() {
        var greenplumInstance, newOwner;

        beforeEach(function() {
            model = rspecFixtures.activity.greenplumInstanceChangedOwner();
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.getModel("greenplumInstance");
            newOwner = model.getModel("newOwner");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CHANGED_OWNER.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    greenplumInstanceLink: linkTo(greenplumInstance.showUrl(), greenplumInstance.name()),
                    newOwnerLink: linkTo(newOwner.showUrl(), newOwner.name())
                }
            );
        });
    });

    context("greenplum instance changed name", function() {
        var greenplumInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.greenplumInstanceChangedName({
                newName: "jane",
                oldName: "john"
            });
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.getModel("greenplumInstance");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CHANGED_NAME.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    greenplumInstanceLink: linkTo(greenplumInstance.showUrl(), greenplumInstance.name()),
                    newName: "jane",
                    oldName: "john"
                }
            );
        });
    });

    context("hadoop instance changed name", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.hadoopInstanceChangedName({
                newName: "jane",
                oldName: "john"
            });
            presenter = new chorus.presenters.Activity(model);
            instance = model.getModel("hadoopInstance");
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.HADOOP_INSTANCE_CHANGED_NAME.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    hadoopInstanceLink: linkTo(instance.showUrl(), instance.name()),
                    newName: "jane",
                    oldName: "john"
                }
            );
        });
    });

    context("workfile created", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workfileCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.getModel("actor");
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workfile = model.getModel("workfile");

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKFILE_CREATED.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workfileLink: linkTo(workfile.showUrl(), workfile.name())
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
                expect(presenter.iconClass).toBe("profile");
            });
        });
    }
});


