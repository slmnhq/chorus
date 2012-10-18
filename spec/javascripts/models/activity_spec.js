describe("chorus.models.Activity", function() {
    beforeEach(function() {
        this.model = rspecFixtures.activity.greenplumInstanceCreated();
    });

    describe("model associations", function() {
        var activity;

        describe("#newOwner", function() {
            it("returns a user with the newOwner data", function() {
                activity = rspecFixtures.activity.greenplumInstanceChangedOwner({
                    actor: { id: 5 },
                    greenplumInstance: { id: 6 },
                    newOwner: { id: 7 }
                });

                var newOwner = activity.newOwner();
                expect(newOwner).toBeA(chorus.models.User);
                expect(newOwner.id).toBe(7);
            });
        });

        describe("#actor", function() {
            it("returns a user with the right data", function() {
                activity = rspecFixtures.activity.greenplumInstanceChangedOwner({
                    actor: { id: 5 },
                    greenplumInstance: { id: 6 },
                    newOwner: { id: 7 }
                });

                var actor = activity.actor();
                expect(actor).toBeA(chorus.models.User);
                expect(actor.id).toBe(5);
            });
        });

        describe("#promoter", function() {
            it("returns a user with the right data", function() {
                activity = rspecFixtures.activity.insightOnGreenplumInstance({
                    promotedBy: { id: 5 },
                    greenplumInstance: { id: 6 }
                });

                var promoter = activity.promoter();
                expect(promoter).toBeA(chorus.models.User);
                expect(promoter.id).toBe(5);
            });
            it("returns null if the note is not an insight", function() {
                activity = rspecFixtures.activity.greenplumInstanceChangedOwner();
                var promoter = activity.promoter();
                expect(promoter).toBeNull();
            });
        });

        describe("#member", function() {
            it("returns a user with the right data", function() {
                activity = rspecFixtures.activity.membersAdded({
                    actor: { id: 5 },
                    member: { id: 6 }
                });

                var member = activity.member();
                expect(member).toBeA(chorus.models.User);
                expect(member.id).toBe(6);
            });
        });

        describe("#hadoopInstance", function() {
            it("returns a hadoop instance with the right data", function() {
                activity = rspecFixtures.activity.hadoopInstanceCreated({
                    hadoopInstance: { id: 8 }
                });

                var hadoopInstance = activity.hadoopInstance();
                expect(hadoopInstance).toBeA(chorus.models.HadoopInstance);
                expect(hadoopInstance.id).toBe(8);
            });
        });

        describe("#gnipInstance", function() {
            it("returns a gnip instance with the right data", function() {
                activity = rspecFixtures.activity.gnipInstanceCreated({
                    gnipInstance: { id: 8 }
                });

                var gnipInstance = activity.gnipInstance();
                expect(gnipInstance).toBeA(chorus.models.GnipInstance);
                expect(gnipInstance.id).toBe(8);
            });
        });

        describe("#greenplumInstance", function() {
            it("returns a greenplum instance with the right data", function() {
                activity = rspecFixtures.activity.greenplumInstanceChangedOwner({
                    actor: { id: 5 },
                    greenplumInstance: { id: 6 },
                    newOwner: { id: 7 }
                });

                var greenplumInstance = activity.greenplumInstance();
                expect(greenplumInstance).toBeA(chorus.models.GreenplumInstance);
                expect(greenplumInstance.id).toBe(6);
            });
        });

         describe("#workspace", function() {
            it("returns a Workspace with the right data", function() {
                activity = rspecFixtures.activity.sourceTableCreated({
                    dataset: { id: 9 }, workspace: {id: 10}
                });

                var workspace = activity.workspace();
                expect(workspace).toBeA(chorus.models.Workspace);
                expect(workspace.id).toBe(10);
            });
        });

        describe("#workfile", function() {
            it("returns a workfile with the right data", function() {
                activity = rspecFixtures.activity.workfileCreated({
                    workfile: {id: 11}
                });

                var workfile = activity.workfile();
                expect(workfile).toBeA(chorus.models.Workfile);
                expect(workfile.id).toBe(11);
            });
        });

        describe("#dataset", function() {
            var dataset;

            beforeEach(function() {
                activity = rspecFixtures.activity.sourceTableCreated({
                    dataset: { id: 9 }, workspace: {id: 10}
                });

                dataset = activity.dataset();
            });

            it("returns a WorkspaceDataset with the right data", function() {
                expect(dataset).toBeA(chorus.models.WorkspaceDataset);
                expect(dataset.id).toBe(9);
            });

            it("adds the workspace data to the dataset", function() {
                expect(dataset.get("workspace").id).toBe(10);
            });
        });

        describe("#sourceDataset", function() {
            var dataset;

            beforeEach(function() {
                activity = rspecFixtures.activity.datasetImportSuccess({
                    sourceDataset: { id: 9, associatedWorkspaces: [{id: 10}]}
                });

                dataset = activity.importSource();
            });

            it("returns a WorkspaceDataset with the right data", function() {
                expect(dataset).toBeA(chorus.models.WorkspaceDataset);
                expect(dataset.id).toBe(9);
            });

            it("adds the workspace data to the sourceDataset", function() {
                expect(dataset.get("associatedWorkspaces")[0].id).toBe(10);
            });
        });

        describe("#newUser", function() {
            it("returns a new user with the right data", function() {
                activity = rspecFixtures.activity.userCreated({
                    newUser: {id: 12}
                });

                var user = activity.newUser();
                expect(user).toBeA(chorus.models.User);
                expect(user.id).toBe(12);
            });
        });

        describe("#noteObject", function() {
            context("for a NoteOnGreenplumInstance", function() {
                it("returns a greenplumInstance with the right data", function() {
                    activity = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                        greenplumInstance: { id: 13 }
                    });

                    var instance = activity.greenplumInstance();
                    expect(instance).toBeA(chorus.models.GreenplumInstance);
                    expect(instance.id).toBe(13);
                });
            });

            context("for a NoteOnGnipInstance", function() {
                it("returns a gnipInstance with the right data", function() {
                    activity = rspecFixtures.activity.noteOnGnipInstanceCreated({
                        gnipInstance: { id: 13 }
                    });

                    var instance = activity.gnipInstance();
                    expect(instance).toBeA(chorus.models.GnipInstance);
                    expect(instance.id).toBe(13);
                });
            });

            context("for a NoteOnHdfsFile", function() {
                it("returns a hdfsFile with the right data", function() {
                    activity = rspecFixtures.activity.noteOnHdfsFileCreated({
                        hdfsFile: { id: 2345, name: "path.txt", hadoopInstance: {id: 331} }
                    });
                    var hdfsFile = activity.noteObject();
                    expect(hdfsFile).toBeA(chorus.models.HdfsEntry);
                    expect(hdfsFile.get("name")).toBe("path.txt");
                    expect(hdfsFile.get("hadoopInstance").id).toBe(331)
                });
            });

            context("for a NoteOnWorkspace", function() {
                it("returns a workspace with the right data", function() {
                    activity = rspecFixtures.activity.noteOnWorkspaceCreated({
                        workspace: { id: 123 }
                    });
                    var workspace = activity.noteObject();
                    expect(workspace).toBeA(chorus.models.Workspace);
                    expect(workspace.get("id")).toBe(123)
                });
            });

            context("for a NoteOnDataset", function() {
                it("returns a dataset with the right data", function() {
                    activity = rspecFixtures.activity.noteOnDatasetCreated({
                        dataset: { id: 123 }
                    });
                    var dataset = activity.noteObject();
                    expect(dataset).toBeA(chorus.models.Dataset);
                    expect(dataset.get("id")).toBe(123)
                });
            });

            context("for a NoteOnWorkspaceDataset", function() {
                it("returns a workspace dataset with the right data", function() {
                    activity = rspecFixtures.activity.noteOnWorkspaceDatasetCreated({
                        dataset: { id: 123 }
                    });
                    var ws_dataset = activity.noteObject();
                    expect(ws_dataset).toBeA(chorus.models.WorkspaceDataset);
                    expect(ws_dataset.get("id")).toBe(123)
                });
            });

            context("for a NoteOnWorkfile", function() {
                it("returns a workfile with the right data", function() {
                    activity = rspecFixtures.activity.noteOnWorkfileCreated({
                        workfile: { id: 123 }
                    });
                    var workfile = activity.noteObject();
                    expect(workfile).toBeA(chorus.models.Workfile);
                    expect(workfile.get("id")).toBe(123)
                });
            });
        });

        describe("#hdfsEntry", function() {
            it("returns hdfs entry with the right data", function() {
                activity = rspecFixtures.activity.hdfsExternalTableCreated({
                    hdfsFile: {
                        id: 1234,
                        hadoopInstance: {id: 1},
                        path : "/data/test/test.csv"
                    }
                });

                var hdfsEntry = activity.hdfsEntry();
                expect(hdfsEntry).toBeA(chorus.models.HdfsEntry);
                expect(hdfsEntry.get("path")).toBe("/data/test")
                expect(hdfsEntry.name()).toBe("test.csv")
                expect(hdfsEntry.get("hadoopInstance").id).toBe(1)
                expect(hdfsEntry.get("id")).toBe(1234)
            });

        });
    });

    describe("#isUserGenerated", function() {
        it("returns true for notes", function() {
            expect(rspecFixtures.activity.noteOnGreenplumInstanceCreated().isUserGenerated()).toBeTruthy();
        });

        it("returns true for 'INSIGHT_CREATED' activities", function() {
            expect(fixtures.activities.INSIGHT_CREATED().isUserGenerated()).toBeTruthy();
        });

        it("returns false for other activities", function() {
            expect(rspecFixtures.activity.membersAdded().isUserGenerated()).toBeFalsy();
        });

        it("returns true for sub-comments", function() {
            expect(rspecFixtures.comment().isUserGenerated()).toBeTruthy();
        });
    });

    describe("#hasCommitMessage", function() {
        it("returns true for activity where action is Workfile_upgrade_version and commit message is not empty", function() {
            expect(rspecFixtures.activity.workfileUpgradedVersion().hasCommitMessage()).toBeTruthy();
        });

        it("returns true for activity where action is WorkfileCreated with commit message", function() {
            expect(rspecFixtures.activity.workfileCreated().hasCommitMessage()).toBeTruthy();
        });

        it("returns false for other activities", function() {
            expect(rspecFixtures.activity.membersAdded().hasCommitMessage()).toBeFalsy();
        });

        it("returns false for activity where action is Workfile_upgrade_version and commit message is empty", function() {
            expect(rspecFixtures.activity.workfileUpgradedVersion({commitMessage: ""}).hasCommitMessage()).toBeFalsy();
        });
    });

    describe("#isFailure", function() {
        it("returns true for IMPORT_FAILED", function() {
            expect(rspecFixtures.activity.fileImportFailed().isFailure()).toBeTruthy();
            expect(rspecFixtures.activity.datasetImportFailed().isFailure()).toBeTruthy();
        });

        it("returns false for other activities", function() {
            expect(rspecFixtures.activity.userCreated().isFailure()).toBeFalsy();
        });
    });

    describe("#isSuccessfulImport", function() {
        it("returns true for IMPORT SUCCESS", function() {
            expect(rspecFixtures.activity.fileImportSuccess().isSuccessfulImport()).toBeTruthy();
            expect(rspecFixtures.activity.datasetImportSuccess().isSuccessfulImport()).toBeTruthy();
        });

        it("returns false for other activities", function() {
            expect(rspecFixtures.activity.fileImportFailed().isSuccessfulImport()).toBeFalsy();
            expect(rspecFixtures.activity.datasetImportFailed().isSuccessfulImport()).toBeFalsy();
        });

    });

    describe("#isOwner", function() {

        it("returns true for notes is current user is the owner of note", function() {
            activity2 = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                greenplumInstance: { id: 13 },
                actor: {id: chorus.session.user().id}

            });
            expect(activity2.isOwner()).toBeTruthy();
        });
        it("returns false for notes is current user is not the owner of note", function() {
            activity2 = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                greenplumInstance: { id: 13 },
                actor: {id: 1}

            });
            expect(activity2.isOwner()).toBeFalsy();
        });

    });

    describe("#toNote", function() {
        beforeEach(function() {
            this.model = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                id: 101
            });

            this.model.collection = chorus.collections.ActivitySet.forDashboard();
        });

        it("returns a note with the right attributes", function() {
            var note = this.model.toNote();
            expect(note).toBeA(chorus.models.Note);
            expect(note.get("id")).toBe(101);
            expect(note.get("body")).toBe(this.model.get("body"));
        });

        describe("when the note is saved", function() {
            it("re-fetches the activity's collection", function() {
                this.model.toNote().trigger("saved");
                expect(this.model.collection).toHaveBeenFetched();
            });
        });

        describe("when the note is destroyed", function() {
            it("re-fetches the activity's collection", function() {
                spyOn(chorus, "toast")
                this.model.toNote().trigger("destroy");
                expect(this.model.collection).toHaveBeenFetched();
            });
        });
    });

    describe("#promoteToInsight", function() {
        beforeEach(function() {
            this.success = jasmine.createSpy("success");
            this.model.collection = chorus.collections.ActivitySet.forDashboard();
            this.model.promoteToInsight({ success: this.success });
        });

        it("posts to the comment insight url with the correct parameters", function() {
            expect(this.server.lastCreate().url).toBe("/insights/promote");
        });

        it("calls the success function", function() {
            this.server.lastCreate().succeed();
            expect(this.success).toHaveBeenCalledWith(this.model);
        });
    });

    describe("#publish", function() {
        it("posts to the comment insight url with the publish action", function() {
            this.model.publish();
            expect(this.server.lastCreate().url).toBe("/insights/publish");
        });
    });

    //TODO activate this for unpublishing the insight
    xdescribe("#unpublish", function() {
        it("posts to the comment insight url with the unpublish action", function() {
            this.model.unpublish();
            expect(this.server.lastCreate().url).toBe("/insights/unpublish");
        });
    });

    describe("#isNote", function() {
        it("returns true for notes", function() {
            this.model.set({ action: "NOTE" });
            expect(this.model.isNote()).toBeTruthy();
        });

        it("returns false for non-notes", function() {
            this.model.set({ type: "WorkspaceMakePublic" });
            expect(this.model.isNote()).toBeFalsy();
        });
    });

    describe("#canBePromotedToInsight", function() {
        it("returns true if it is a note but not an insight", function() {
            this.model.set({ action: "NOTE", isInsight: false });
            expect(this.model.canBePromotedToInsight()).toBeTruthy();
        });

        it("returns false for insights", function() {
            this.model.set({ action: "NOTE", isInsight: true });
            expect(this.model.canBePromotedToInsight()).toBeFalsy();
        });

        it("returns false for non-notes", function() {
            this.model.set({ type: "WorkspaceMakePublic" });
            expect(this.model.canBePromotedToInsight()).toBeFalsy();
        });
    });

    describe("#isInsight", function() {
        it("returns true for insights", function() {
            this.model.set({ isInsight: true });
            expect(this.model.isInsight()).toBeTruthy();
        });

        it("returns false for non-insights", function() {
            this.model.set({ type: "WorkspaceMakePublic" });
            expect(this.model.isInsight()).toBeFalsy();
        });
    });

    describe("#isPublished", function() {
        it("returns true for published insights", function() {
            this.model.set({ isInsight: true, isPublished: true });
            expect(this.model.isPublished()).toBeTruthy();
        });

        it("returns false for non-insights", function() {
            this.model.set({ type: "WorkspaceMakePublic" });
            expect(this.model.isPublished()).toBeFalsy();
        });

        it("returns false for non-published insights", function() {
            this.model.set({ type: "WorkspaceMakePublic", isInsight: true, isPublished: false });
            expect(this.model.isPublished()).toBeFalsy();
        });
    });

    describe("#isSubComment", function() {
        it("returns true for sub-comments", function() {
            this.model.set({ action: "SUB_COMMENT" });
            expect(this.model.isSubComment()).toBeTruthy();
        });

        it("returns false for anything else", function() {
            this.model.set({ type: "NOTE" });
            expect(this.model.isSubComment()).toBeFalsy();
        });
    });

    describe("#isPublished", function() {
        it("returns true for insights that are published", function() {
            this.model.set({isPublished: true});
            expect(this.model.isPublished()).toBeTruthy();
        });

        it("returns false for insights that are not published", function() {
            this.model.set({isPublished: false});
            expect(this.model.isPublished()).toBeFalsy();
        });

        it("returns false for non-insights", function() {
            this.model.set({isPublished: undefined});
            expect(this.model.isPublished()).toBeFalsy();
        });
    });

    describe("#author", function() {
        context("when author information is present", function() {
            beforeEach(function() {
               this.model = rspecFixtures.comment();
            });
            it("creates a user", function() {
                expect(this.model.author()).toBeA(chorus.models.User);
            });

            it("returns the same instance when called multiple times", function() {
                expect(this.model.author()).toBe(this.model.author());
            });
        });

        context("when actor information is present", function () {
            beforeEach(function() {
                this.model = rspecFixtures.activity.noteOnWorkspaceCreated()
            });
            it("creates a user", function() {
                expect(this.model.author()).toBeA(chorus.models.User);
            });

            it("returns the same instance when called multiple times", function() {
                expect(this.model.author()).toBe(this.model.author());
            });
        });

        context("when author information is not present", function() {
            beforeEach(function() {
                this.model.unset("author");
                this.model.unset("actor");
            });

            it("returns undefined", function() {
                expect(this.model.author()).toBeUndefined();
            });
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.model.set({
                comments: [
                    {
                        text: "I'm cold.'",
                        author: {
                            image: { original: "/foo", icon: "/bar" },
                            id: "1234",
                            lastName: "Smith",
                            firstName: "Bob"
                        },
                        timestamp: "2011-12-15 12:34:56"
                    }
                ]
            });
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments).toBeA(chorus.collections.CommentSet);
        });

        it("memoizes", function() {
            expect(this.comments).toBe(this.model.comments());
        });

        it("contains the activity item's comments", function() {
            var commentsJson = this.model.get("comments");
            expect(this.comments.models[0].get("text")).toBe(commentsJson[0].text);
            expect(this.comments.models[0].get("timestamp")).toBe(commentsJson[0].timestamp);
            expect(this.comments.models[0].author().get("firstName")).toBe(commentsJson[0].author.firstName);
        });

        xit("sets the entityType and entityId as attributes of the CommentSet", function() {
            expect(this.comments.attributes.entityType).toBe("workspace");
            expect(this.comments.attributes.entityId).toBe(10000);
        });
    });

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                attachments: [
                    { entityType: "workfile", id: 1 },
                    { entityType: "attachment", id: 2 },
                    { entityType: "dataset", id: 3 },
                    { entityType: "chorusView", id: 4 }
                ]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles, Attachments Datasets)", function() {
            expect(this.attachments[0]).toBeA(chorus.models.Workfile)
            expect(this.attachments[1]).toBeA(chorus.models.Attachment)
            expect(this.attachments[2]).toBeA(chorus.models.WorkspaceDataset)
            expect(this.attachments[3]).toBeA(chorus.models.WorkspaceDataset)
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
