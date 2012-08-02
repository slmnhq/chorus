describe("chorus.presenters.Activity", function() {
    var model, actor, presenter, workfile, workspace, dataset, member;

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

        describe("#canDelete", function() {
            beforeEach(function() {
                model = rspecFixtures.activity.noteOnGreenplumInstanceCreated();
                presenter = new chorus.presenters.Activity(model);
            });

            context("User is admin", function() {
                it("returns true", function() {
                    setLoggedInUser({ admin: true });
                    expect(presenter.canDelete()).toBeTruthy();
                });
            });

            context ("user is owner of the note" , function() {
                it("returns true", function() {
                    setLoggedInUser({ admin: false, id: model.actor().id });
                    expect(presenter.canDelete()).toBeTruthy();
                });
            });

            context ("user is neither owner or admin" , function() {
                it("returns false", function() {
                    setLoggedInUser({ admin: false });
                    expect(presenter.canDelete()).toBeFalsy();
                });
            });
        });

        describe("#canEdit", function() {
            beforeEach(function() {
                model = rspecFixtures.activity.noteOnGreenplumInstanceCreated();
                presenter = new chorus.presenters.Activity(model);
            });

            context ("user is owner of the note" , function() {
                it("returns true", function() {
                    setLoggedInUser({ id: model.actor().id });
                    expect(presenter.canEdit()).toBeTruthy();
                });
            });

            context ("user is not the owner" , function() {
                it("returns false", function() {
                    setLoggedInUser({ id: 12341324 });
                    expect(presenter.canEdit()).toBeFalsy();
                });
            });
        });

        describe("#isNote", function() {
            context ("when it is a note" , function() {
                beforeEach(function() {
                    model = rspecFixtures.activity.noteOnGreenplumInstanceCreated();
                    presenter = new chorus.presenters.Activity(model);
                });
                it("returns true", function() {
                    setLoggedInUser({ id: model.actor().id });
                    expect(presenter.isNote()).toBeTruthy();
                });
            });

            context ("when it is a not a note" , function() {
                beforeEach(function() {
                    model = rspecFixtures.activity.greenplumInstanceCreated();
                    presenter = new chorus.presenters.Activity(model);
                });
                it("returns false", function() {
                    setLoggedInUser({ id: model.actor().id });
                    expect(presenter.isNote()).toBeFalsy();
                });
            });
        })
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

    context("public workspace created", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.publicWorkspaceCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.PUBLIC_WORKSPACE_CREATED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("private workspace created", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.privateWorkspaceCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.PUBLIC_WORKSPACE_CREATED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("workspace make public", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workspaceMakePublic();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_MAKE_PUBLIC.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("workspace make private", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workspaceMakePrivate();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_MAKE_PRIVATE.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("workspace archived", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workspaceArchived();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_ARCHIVED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });

    });

    context("workspace unarchived", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workspaceUnarchived();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workspace = model.workspace();

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WORKSPACE_UNARCHIVED.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
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
            dataset = model.dataset();
            workspace = model.workspace();

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
        var hdfsFile;

        beforeEach(function() {
            model = rspecFixtures.activity.hdfsExternalTableCreated()
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
            hdfsEntry = model.hdfsEntry();
        });

        itHasTheActorIcon();

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

    context("import success", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.fileImportSuccess();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
        });

        itHasTheImportIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.IMPORT_SUCCESS.default", {
                    importType: model.get("importType"),
                    importSourceLink: model.get("fileName"),
                    datasetType: t("dataset.types.table"),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            )
        });
    });

    context("import failed", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.fileImportFailed();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
        });

        itHasTheErrorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.IMPORT_FAILED.default", {
                    importType: model.get("importType"),
                    importSourceLink: model.get("fileName"),
                    datasetType: t("dataset.types.table"),
                    datasetLink: model.get('destinationTable'),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            )
        });
    });

    context("note on a hdfs file", function() {
        var hdfsFile;

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

        itHasTheActorIcon();

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

    context("note on a greenplum instance", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                greenplumInstance: {
                    id: 42,
                    name: 'my_instance'
                }
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            instance = rspecFixtures.greenplumInstance({id: 42, name: 'my_instance'});
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(instance.showUrl(), instance.name()),
                    noteObjectType: "Greenplum instance"
                }
            )
        });
    });

    context("note on a workspace ", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.noteOnWorkspaceCreated({
                workspace: {
                    name: 'le_workspace',
                    id: 42
                }
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = rspecFixtures.workspace({id: 42, name: 'le_workspace' });
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(workspace.showUrl(), workspace.name()),
                    noteObjectType: "workspace"
                }
            )
        });
    });

    context("note on a hadoop instance", function() {
        var instance;

        beforeEach(function() {
            model = rspecFixtures.activity.noteOnHadoopInstanceCreated({
                hadoopInstance: {
                    id: 42,
                    name: 'my_instance'
                }
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            instance = rspecFixtures.hadoopInstance({id: 42, name: 'my_instance'});
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(instance.showUrl(), instance.name()),
                    noteObjectType: "Hadoop instance"
                }
            )
        });
    });

    context("note on a dataset", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.noteOnDatasetCreated({
                dataset: { id: 42, objectName: "lunch_boxes" }
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            dataset = model.noteObject();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.without_workspace", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(dataset.showUrl(), dataset.name()),
                    noteObjectType: t("dataset.types.table")
                }
            );
        });
    });

    context("note on a workspace dataset", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.noteOnWorkspaceDatasetCreated({
                dataset: { id: 42, objectName: "lunch_boxes" },
                workspace: { id: 55, name: "paleo_eaters" }
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            dataset = model.noteObject();
            workspace = model.workspace();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.NOTE.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    noteObjectLink: linkTo(dataset.showUrl(), dataset.name()),
                    noteObjectType: t("dataset.types.table"),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("members added event", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.membersAdded({
                workspace: { id: 55, name: "paleo_eaters" },
                member: { id: 66, firstName: "Susie", lastName: "Cupcake"}
            });
            actor = model.actor();
            workspace = model.workspace();
            member = model.member();

            activity_data = {
                actorLink: linkTo(actor.showUrl(), actor.name()),
                workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                memberLink: linkTo(member.showUrl(), member.name())
            };
            activity_without_workspace_data = {
                actorLink: linkTo(actor.showUrl(), actor.name()),
                memberLink: linkTo(member.showUrl(), member.name())
            };
        });

        context("the actor icon is displayed", function () {
            beforeEach(function() {
                presenter = new chorus.presenters.Activity(model);
            });
            itHasTheActorIcon();
        });

        context("a single member is added", function() {
            beforeEach(function () {
                model.set({numAdded: "1"})
                presenter = new chorus.presenters.Activity(model);
            });

            it("has the right header html for the default style", function() {
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.default.one",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];

                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.without_workspace.one",
                    activity_without_workspace_data
                );
            });
        });

        context("two members are added", function() {
            beforeEach(function () {
                model.set({numAdded: "2"})
                presenter = new chorus.presenters.Activity(model);
            });

            it("has the right header html for the default style", function() {
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.default.two",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];

                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.without_workspace.two",
                    activity_without_workspace_data
                );
            });
        });

        context("more than two members are added", function() {
            beforeEach(function () {
                model.set({numAdded: "5"});
                presenter = new chorus.presenters.Activity(model);
            });

            it("has the right header html for the default style", function() {
                activity_data["count"] = model.get("numAdded");
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.default.many",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];
                activity_without_workspace_data["count"] = model.get("numAdded");
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MEMBERS_ADDED.without_workspace.many",
                        activity_without_workspace_data
                );
            });
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

    function itHasTheErrorIcon() {
        describe("the icon", function() {
            it("shows the error icon", function() {
                expect(presenter.iconSrc()).toBe("/images/message_error.png");
            });

            it("links to the user's profile", function() {
                expect(presenter.iconHref()).toBeNull();
            });

            it("has the class 'profile'", function() {
                expect(presenter.iconClass()).toBe("error");
            });
        });
    }

    function itHasTheImportIcon() {
        describe("the icon", function() {
            it("shows the error icon", function() {
                expect(presenter.iconSrc()).toBe("/images/import_icon.png");
            });

            it("links to dataset", function() {
                expect(presenter.iconHref()).toBe(dataset.showUrl());
            });

            it("has the class 'profile'", function() {
                expect(presenter.iconClass()).toBe("icon");
            });
        });
    }
});


