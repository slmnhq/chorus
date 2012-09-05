describe("chorus.presenters.Activity", function() {
    var model, actor, presenter, workfile, workspace, dataset, member, sourceDataset;

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
                        "activity.header.WorkfileCreated.without_workspace", {
                            actorLink: linkTo(actor.showUrl(), actor.name()),
                            workfileLink: linkTo(workfile.showUrl(), workfile.name())
                        }
                    );
                });

                it("returns the translation for the default style if no style is provided " +
                    "and the model has a valid workspace", function() {
                    presenter.options.displayStyle = null;
                    expect(presenter.headerHtml().toString()).toContainTranslation(
                        "activity.header.WorkfileCreated.default", {
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
            var noteObject;

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
                "activity.header.GreenplumInstanceCreated.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    greenplumInstanceLink: linkTo(greenplumInstance.showUrl(), greenplumInstance.name())
                }
            );
        });
    });

    context("aurora instance provisioned", function() {
        var greenplumInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.auroraInstanceProvisioned();
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.greenplumInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.ProvisioningSuccess.default", {
                    greenplumInstanceLink: linkTo(greenplumInstance.showUrl(), greenplumInstance.name()),
                    instanceAddress: greenplumInstance.get("host")
                }
            );
        });
    });

    context("aurora instance provisioning fails", function() {
        var greenplumInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.auroraInstanceProvisioningFailed();
            presenter = new chorus.presenters.Activity(model);
            greenplumInstance = model.greenplumInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.ProvisioningFail.default", {
                    greenplumInstanceName: greenplumInstance.name()
                }
            );
        });
    });

    context("hadoop instance created", function() {
        var hadoopInstance;

        beforeEach(function() {
            model = rspecFixtures.activity.hadoopInstanceCreated();
            presenter = new chorus.presenters.Activity(model);
            hadoopInstance = model.hadoopInstance();
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toContainTranslation(
                "activity.header.HadoopInstanceCreated.default", {
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
                "activity.header.GreenplumInstanceChangedOwner.default", {
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
                "activity.header.GreenplumInstanceChangedName.default", {
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
                "activity.header.HadoopInstanceChangedName.default", {
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
                "activity.header.PublicWorkspaceCreated.default", {
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
                "activity.header.PublicWorkspaceCreated.default", {
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
                "activity.header.WorkspaceMakePublic.default", {
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
                "activity.header.WorkspaceMakePrivate.default", {
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
                "activity.header.WorkspaceArchived.default", {
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
                "activity.header.WorkspaceUnarchived.default", {
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
                "activity.header.WorkfileCreated.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workfileLink: linkTo(workfile.showUrl(), workfile.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("workfile upgrade version", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.workfileUpgradedVersion();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            var workfile = model.workfile();
            var workspace = workfile.workspace();
            var workfile_version = new chorus.models.Workfile({
                versionInfo: { id : model.get("versionId") },
                id : workfile.id,
                workspace: workspace
            });

            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WorkfileUpgradedVersion.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workfileLink: linkTo(workfile.showUrl(), workfile.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                    versionLink: linkTo(workfile_version.showUrl(), t("workfile.version_title", { versionNum: model.get("versionNum") }))
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
                "activity.header.SourceTableCreated.default", {
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
                "activity.header.WorkspaceAddSandbox.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            );
        });
    });

    context("add a hdfs file as external table", function() {
        var hdfsEntry;

        beforeEach(function() {
            model = rspecFixtures.activity.hdfsExternalTableCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
            hdfsEntry = model.hdfsEntry();
        });

        itHasTheActorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.WorkspaceAddHdfsAsExtTable.default", {
                    actorLink: linkTo(actor.showUrl(), actor.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                    hdfsEntryLink: linkTo(hdfsEntry.showUrl(), hdfsEntry.name()),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name())
                }
            )
        });
    });

    context("file import success", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.fileImportSuccess();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
        });

        itHasTheImportIcon();

        it("has the right header html", function() {
            presenter.options.displayStyle = ["without_workspace"];
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.FileImportSuccess.default", {
                    importType: model.get("importType"),
                    importSourceLink: model.get("fileName"),
                    datasetType: t("dataset.types.table"),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            )
        });
    });

    context("dataset import success", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.datasetImportSuccess();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
            sourceDataset = model.importSource();
        });

        itHasTheImportIcon();

        it("has the right header html", function() {
            presenter.options.displayStyle = ["without_workspace"];
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.DatasetImportSuccess.default", {
                    importSourceDatasetLink: linkTo(sourceDataset.showUrl(), sourceDataset.name()),
                    datasetType: t("dataset.types.table"),
                    datasetLink: linkTo(dataset.showUrl(), dataset.name()),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            )
        });
    });

    context("file import failed", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.fileImportFailed();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
        });

        itHasTheErrorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.FileImportFailed.default", {
                    importType: model.get("importType"),
                    importSourceLink: model.get("fileName"),
                    datasetType: t("dataset.types.table"),
                    datasetLink: model.get('destinationTable'),
                    workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                }
            )
        });
    });

    context("dataset import failed", function() {
        beforeEach(function() {
            model = rspecFixtures.activity.datasetImportFailed();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            sourceDataset = model.importSource();
        });

        itHasTheErrorIcon();

        it("has the right header html", function() {
            expect(presenter.headerHtml().toString()).toMatchTranslation(
                "activity.header.DatasetImportFailed.default", {
                    importSourceDatasetLink: linkTo(sourceDataset.showUrl(), sourceDataset.name()),
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
                hdfsFile: { isDir: false, id: 4567, name: "path.csv", hadoopInstance: {id: 1234}}
            });
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            hdfsFile = rspecFixtures.hdfsDir({
                id: 4567,
                hadoopInstance: { id: 1234 },
                name: "path.csv",
                isDir: false
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
        var activity_data, activity_without_workspace_data;
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
                model.set({numAdded: "1"});
                presenter = new chorus.presenters.Activity(model);
            });

            it("has the right header html for the default style", function() {
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MembersAdded.default.one",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];

                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MembersAdded.without_workspace.one",
                    activity_without_workspace_data
                );
            });
        });

        context("two members are added", function() {
            beforeEach(function () {
                model.set({numAdded: "2"});
                presenter = new chorus.presenters.Activity(model);
            });

            it("has the right header html for the default style", function() {
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MembersAdded.default.two",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];

                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MembersAdded.without_workspace.two",
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
                    "activity.header.MembersAdded.default.many",
                    activity_data
                );
            });

            it("has the right header html for the without_workspace style", function() {
                presenter.options.displayStyle = ["without_workspace"];
                activity_without_workspace_data["count"] = model.get("numAdded");
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.MembersAdded.without_workspace.many",
                        activity_without_workspace_data
                );
            });
        });
    });

    context("file import created event", function() {
        var activity_data;
        beforeEach(function () {
            model = rspecFixtures.activity.fileImportCreated();
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();

            activity_data = {
                actorLink: linkTo(actor.showUrl(), actor.name()),
                workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                importType: model.get("importType"),
                importSourceLink: model.get("fileName"),
                datasetType: t("dataset.types.table"),
                destObjectOrName: "bobs_table"
            };
        });
        context("when called with a FILE_IMPORT_CREATED event", function () {
            it("blank out the without_workspace style and use default instead", function () {
                presenter.options.displayStyle = ["without_workspace"];
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.FileImportCreated.default",
                    activity_data
                );
            });
            context("when importing to a new table", function () {
                it("displays the destination table name without link", function () {
                    expect(presenter.headerHtml().toString()).toMatchTranslation(
                        "activity.header.FileImportCreated.default",
                        activity_data
                    );
                });
            });
            context("when importing to an existing table", function () {
                var datasetModel;
                beforeEach(function () {
                    datasetModel = rspecFixtures.dataset();
                    model = rspecFixtures.activity.fileImportCreated({dataset: datasetModel});
                    dataset = model.dataset();
                    activity_data["destObjectOrName"] = linkTo(dataset.showUrl(), dataset.name());
                    presenter = new chorus.presenters.Activity(model);
                });
                it("displays the destination table name with dataset link", function () {
                    expect(presenter.headerHtml().toString()).toMatchTranslation(
                        "activity.header.FileImportCreated.default",
                        activity_data
                    );
                });
            });
        });
    });


    context("dataset import created event", function() {
        var activity_data;
        beforeEach(function () {
            datasetModel = rspecFixtures.dataset();
            model = rspecFixtures.activity.datasetImportCreated({dataset: datasetModel});
            presenter = new chorus.presenters.Activity(model);
            actor = model.actor();
            workspace = model.workspace();
            dataset = model.dataset();
            sourceDataset = model.importSource();

            activity_data = {
                actorLink: linkTo(actor.showUrl(), actor.name()),
                workspaceLink: linkTo(workspace.showUrl(), workspace.name()),
                importSourceDatasetLink: linkTo(sourceDataset.showUrl(), sourceDataset.name()),
                datasetType: t("dataset.types.table"),
                destObjectOrName: linkTo(dataset.showUrl(), dataset.name())
            };
        });
        context("when called with a DATASET_IMPORT_CREATED event", function () {
            it("blank out the without_workspace style and use default instead", function () {
                presenter.options.displayStyle = ["without_workspace"];
                expect(presenter.headerHtml().toString()).toMatchTranslation(
                    "activity.header.DatasetImportCreated.default",
                    activity_data
                );
            });
            context("when importing to a new table", function () {
                beforeEach(function() {
                    datasetModel = rspecFixtures.dataset();
                    model = rspecFixtures.activity.datasetImportCreated();
                    dataset = model.dataset();
                    presenter = new chorus.presenters.Activity(model);
                    activity_data["destObjectOrName"] =  "other_table"
                });
                it("displays the destination table name without link", function () {
                    rspecFixtures.activity.datasetImportCreated();
                    expect(presenter.headerHtml().toString()).toMatchTranslation(
                        "activity.header.DatasetImportCreated.default",
                        activity_data
                    );
                });
            });
            context("when importing to an existing table", function () {
                var datasetModel;
                beforeEach(function () {
                    datasetModel = rspecFixtures.dataset();
                    model = rspecFixtures.activity.datasetImportCreated({dataset: datasetModel});
                    dataset = model.dataset();
                    presenter = new chorus.presenters.Activity(model);
                });
                it("displays the destination table name with dataset link", function () {
                    expect(presenter.headerHtml().toString()).toMatchTranslation(
                        "activity.header.DatasetImportCreated.default", {
                            actorLink: linkTo(actor.showUrl(), actor.name()),
                            importSourceDatasetLink: linkTo(sourceDataset.showUrl(), sourceDataset.name()),
                            datasetType: t("dataset.types.table"),
                            destObjectOrName: linkTo(dataset.showUrl(), dataset.name()),
                            workspaceLink: linkTo(workspace.showUrl(), workspace.name())
                    }
                    );
                });
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


