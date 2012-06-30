describe("chorus.models.Activity", function() {
    beforeEach(function() {
        this.model = fixtures.activity();
    });

    describe("model associations", function() {
        var activity1, activity2, activity3, activity4, activity5, activity6, activity7;

        beforeEach(function() {
            activity1 = rspecFixtures.activity.greenplumInstanceChangedOwner({
                actor: { id: 5 },
                greenplumInstance: { id: 6 },
                newOwner: { id: 7 }
            });

            activity2 = rspecFixtures.activity.hadoopInstanceCreated({
                hadoopInstance: { id: 8 }
            });

            activity3 = rspecFixtures.activity.sourceTableCreated({
                dataset: { id: 9 }, workspace: {id: 10}

            });
            activity4 = rspecFixtures.activity.workfileCreated({
                workfile: {id: 11}
            });

            activity5 = rspecFixtures.activity.userCreated({
                newUser: {id: 12}
            });

            activity6 = rspecFixtures.activity.noteOnGreenplumInstanceCreated({
                greenplumInstance: { id: 13 }
            });
            
            activity6 = rspecFixtures.activity.hdfsExternalTableCreated({
                hadoopInstanceId: 1,
                path : "/data",
                hdfsFileName : "test.csv"
            });

        });

        describe("#newOwner", function() {
            it("returns a user with the newOwner data", function() {
                var newOwner = activity1.newOwner();
                expect(newOwner).toBeA(chorus.models.User);
                expect(newOwner.id).toBe(7);
            });
        });

        describe("#actor", function() {
            it("returns a user with the right data", function() {
                var actor = activity1.actor();
                expect(actor).toBeA(chorus.models.User);
                expect(actor.id).toBe(5);
            });
        });

        describe("#hadoopInstance", function() {
            it("returns a hadoop instance with the right data", function() {
                var hadoopInstance = activity2.hadoopInstance();
                expect(hadoopInstance).toBeA(chorus.models.HadoopInstance);
                expect(hadoopInstance.id).toBe(8);
            });
        });

        describe("#greenplumInstance", function() {
            it("returns a greenplum instance with the right data", function() {
                var greenplumInstance = activity1.greenplumInstance();
                expect(greenplumInstance).toBeA(chorus.models.GreenplumInstance);
                expect(greenplumInstance.id).toBe(6);
            });
        });

         describe("#workspace", function() {
            it("returns a Workspace with the right data", function() {
                var workspace = activity3.workspace();
                expect(workspace).toBeA(chorus.models.Workspace);
                expect(workspace.id).toBe(10);
            });
        });

        describe("#workfile", function() {
            it("returns a workfile with the right data", function() {
                var workfile = activity4.workfile();
                expect(workfile).toBeA(chorus.models.Workfile);
                expect(workfile.id).toBe(11);
            });
        });

        describe("#dataset", function() {
            var dataset;

            beforeEach(function() {
                dataset = activity3.dataset();
            });

            it("returns a WorkspaceDataset with the right data", function() {
                expect(dataset).toBeA(chorus.models.WorkspaceDataset);
                expect(dataset.id).toBe(9);
            });

            it("adds the workspace data to the dataset", function() {
                expect(dataset.get("workspace").id).toBe(10);
            });
        });

        describe("#newUser", function() {
            it("returns a new user with the right data", function() {
                var user = activity5.newUser();
                expect(user).toBeA(chorus.models.User);
                expect(user.id).toBe(12);
            });
        });

        describe("#noteObject", function() {
            it("returns a greenplumInstance with the right data", function() {
                var instance = activity6.greenplumInstance();
                expect(instance).toBeA(chorus.models.GreenplumInstance);
                expect(instance.id).toBe(13);
            });
        });
        
        
        describe("#hdfsEntry", function() {
            it("returns hdfs entry with the right data", function() {
                var hdfsEntry = activity7.hdfsEntry();
                expect(hdfsEntry).toBeA(chorus.models.HdfsEntry);
                expect(hdfsEntry.get("path")).toBe("/data")
                expect(hdfsEntry.name()).toBe("test.csv")
                expect(hdfsEntry.get("hadoopInstance").id).toBe(1)
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
            expect(fixtures.activities.MEMBERS_ADDED().isUserGenerated()).toBeFalsy();
        });

        it("returns true for sub-comments", function() {
            expect(fixtures.activities.SUB_COMMENT().isUserGenerated()).toBeTruthy();
        });
    });

    xdescribe("#toComment", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_INSTANCE({ id: "101", instance: { id: "45" } });
            this.model.collection = chorus.collections.ActivitySet.forDashboard();
        });

        it("returns a comment with the right attributes", function() {
            var comment = this.model.toComment();
            expect(comment).toBeA(chorus.models.Comment);
            expect(comment.get("id")).toBe("101");
            expect(comment.get("body")).toBe(this.model.get("text"));
        });

        describe("when the comment is saved", function() {
            beforeEach(function() {
                this.model.toComment().trigger("saved");
            });

            it("re-fetches the activity's collection", function() {
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

        it("posts to the comment insight url", function() {
            expect(this.server.lastCreate().url).toBe("/commentinsight/" + this.model.get("id") + "/promote");
        });

        it("calls the success function", function() {
            this.server.lastCreate().succeed();
            expect(this.success).toHaveBeenCalledWith(this.model);
        });
    });

    describe("#publish", function() {
        it("posts to the comment insight url with the publish action", function() {
            this.model.publish();
            expect(this.server.lastCreate().url).toBe("/commentinsight/" + this.model.get("id") + "/publish");
        });
    });

    describe("#unpublish", function() {
        it("posts to the comment insight url with the unpublish action", function() {
            this.model.unpublish();
            expect(this.server.lastCreate().url).toBe("/commentinsight/" + this.model.get("id") + "/unpublish");
        });
    });

    describe("#isNote", function() {
        it("returns true for notes", function() {
            this.model.set({ action: "NOTE" });
            expect(this.model.isNote()).toBeTruthy();
        });

        it("returns false for non-notes", function() {
            this.model.set({ type: "WORKSPACE_MAKE_PUBLIC" });
            expect(this.model.isNote()).toBeFalsy();
        });
    });

    describe("#isInsight", function() {
        it("returns true for insights", function() {
            this.model.set({ type: "INSIGHT_CREATED" });
            expect(this.model.isInsight()).toBeTruthy();
        });

        it("returns false for non-insights", function() {
            this.model.set({ type: "WORKSPACE_MAKE_PUBLIC" });
            expect(this.model.isInsight()).toBeFalsy();
        });
    });

    describe("#isSubComment", function() {
        it("returns true for sub-comments", function() {
            this.model.set({ type: "SUB_COMMENT" });
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
            });

            it("returns undefined", function() {
                expect(this.model.author()).toBeUndefined();
            });
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.activitySet = new chorus.collections.ActivitySet([this.model], {entityType: "workspace", entityId: 10000})
            this.model.set({
                comments: [
                    {
                        text: "I'm cold.'",
                        author: fixtures.authorJson(),
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

        it("sets the entityType and entityId as attributes of the CommentSet", function() {
            expect(this.comments.attributes.entityType).toBe("workspace");
            expect(this.comments.attributes.entityId).toBe(10000);
        });
    });

    describe("#parentComment", function() {
        beforeEach(function() {
            this.model = fixtures.activities.COMMENT_ON_NOTE_ON_DATABASE_TABLE();
            this.parentComment = this.model.parentComment();
        });

        it("should return a comment activity", function() {
            expect(this.parentComment).toBeA(chorus.models.Activity);
        });

        xit("should retain the data", function() {
           expect(this.parentComment.dataset().name()).toBe(this.model.get("parentComment").dataset.name);
        });

        it("memoizes", function() {
            expect(this.parentComment).toBe(this.model.parentComment());
        })
    });

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                artifacts: [
                    { entityType: "workfile", id: 1 },
                    { entityType: "artifact", id: 2 },
                    { entityType: "dataset", id: 3 },
                    { entityType: "chorusView", id: 4 }
                ]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles, ArtifaWorkspaceDatasetd Datasets)", function() {
            expect(this.attachments[0]).toBeA(chorus.models.Workfile)
            expect(this.attachments[1]).toBeA(chorus.models.Artifact)
            expect(this.attachments[2]).toBeA(chorus.models.WorkspaceDataset)
            expect(this.attachments[3]).toBeA(chorus.models.WorkspaceDataset)
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
