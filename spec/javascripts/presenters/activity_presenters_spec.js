describe("chorus.presenters.Activity", function() {
    var model, actor, presenter, workfile, workspace;

    describe("common aspects", function() {
        context("activity with a workspace", function() {
            beforeEach(function() {
                model = rspecFixtures.activity.workfileCreated();
                workfile = model.workfile();
                workspace = model.workspace();
                presenter = new chorus.presenters.Activity(model);
                actor = model.actor();
            });

            it("includes the relative timestamp", function() {
                var relativeTime = chorus.helpers.relativeTimestamp(model.get("timestamp"));
                expect(presenter.timestamp()).toBe(relativeTime);
            });

            describe("#headerHtml", function() {
                it("returns the translation for the first style that matches", function() {
                    presenter.options.displayStyle = ["without_object", "without_workspace"];
                    expect(presenter.headerHtml().toString()).toContainTranslation(
                        "activity.header.WORKFILE_CREATED.without_workspace", {
                            actorLink: linkTo(actor.showUrl(), actor.name()),
                            workfileLink: linkTo(workfile.showUrl(), workfile.name())
                        }
                    );
                });

                it("returns the translation for the default style if no style is provided " +
                    "and the model has a valid workspace", function() {
                    presenter.options.displayStyle = null
                    expect(presenter.headerHtml().toString()).toContainTranslation(
                        "activity.header.WORKFILE_CREATED.default", {
                            actorLink: linkTo(actor.showUrl(), actor.name()),
                            workfileLink: linkTo(workfile.showUrl(), workfile.name()),
                            workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                        }
                    );
                });

                it("returns a handlebars safe-string (so that html won't be stripped)", function() {
                    expect(presenter.headerHtml()).toBeA(Handlebars.SafeString);
                });
            });
        });

        context("activity without a workspace", function() {
            beforeEach(function() {
                model = rspecFixtures.activity.noteOnGreenplumInstanceCreated();
                noteObject = model.greenplumInstance();
                presenter = new chorus.presenters.Activity(model);
                actor = model.actor();
            });
            describe("#headerHtml", function() {
                it("returns the translation for the without_workspace style if no style is provided " +
                    "and the model does not have a valid workspace", function() {
                    presenter.options.displayStyle = null;
                    expect(presenter.headerHtml().toString()).toContainTranslation(
                        "activity.header.NOTE.without_workspace", {
                            actorLink: linkTo(actor.showUrl(), actor.name()),
                            noteObjectLink: linkTo(noteObject.showUrl(), noteObject.name()),
                            noteObjectType: "Greenplum instance"
                        }
                    );
                });
            });
        });
    });

    context("greenplum instance created", function() {
        var greenplumInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.greenplumInstanceCreated();
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.greenplumInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CREATED.default", {
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
            hadoopInstance = model.hadoopInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.HADOOP_INSTANCE_CREATED.default", {
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
            greenplumInstance = model.greenplumInstance();
            newOwner = model.newOwner();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CHANGED_OWNER.default", {
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
            greenplumInstance = model.greenplumInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.GREENPLUM_INSTANCE_CHANGED_NAME.default", {
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
            instance = model.hadoopInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.HADOOP_INSTANCE_CHANGED_NAME.default", {
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
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workfile = model.workfile();
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKFILE_CREATED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workfileLink: linkTo(workfile.showUrl(), workfile.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("source table created", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.sourceTableCreated({ dataset: { objectType: "VIEW" } });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var dataset = model.dataset();
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.SOURCE_TABLE_CREATED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name()),
                    datasetType: t("dataset.types.view")
                }
            );
        });
    });

    context("sandbox added", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.sandboxAdded();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_ADD_SANDBOX.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("add a hdfs file as external table", function() {
        var dataset, hdfsFile;

        beforeEach(function() {
            model = rspecFixtures.activity.hdfsExternalTableCreated()
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
            hdfsEntry = model.hdfsEntry();
        });

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_ADD_HDFS_AS_EXT_TABLE.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                    hdfsEntryLink: linkTo(hdfsEntry.showUrl(), hdfsEntry.name()),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name())
                }
            )
        });
    });

    context("note on a hdfs file", function() {
        var dataset, hdfsFile;

        beforeEach(function() {
            model = rspecFixtures.activity.noteOnHdfsFileCreated({
                hdfsFile: { hadoopInstanceId: 1234, path: "/random/path.csv" }
            })
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            hdfsFile = rspecFixtures.hdfsFile({
                hadoopInstance: { id: 1234 },
                path: "/random/path.csv"
            });
        });

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(hdfsFile.showUrl(), hdfsFile.name()),
                    noteObjectType: "file"
                }
            )
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


