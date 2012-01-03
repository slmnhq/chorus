describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#initialize", function() {
        context("with an instance", function() {
            it("creates an instance object", function() {
                var json = fixtures.activityJson({instance: fixtures.instanceJson()});
                var activity = new chorus.models.Activity(json);
                expect(activity.get('instance')).toBeDefined();
                expect(activity.get('instance')).toBeA(chorus.models.Instance);
            });
        });

        context("with a workspace", function() {
            it("creates an workspace object", function() {
                var json = fixtures.activityJson({workspace: fixtures.workspaceJson()});
                var activity = new chorus.models.Activity(json);
                expect(activity.get('workspace')).toBeDefined();
                expect(activity.get('workspace')).toBeA(chorus.models.Workspace);
            });
        });

        context("with a workfile and a workspace", function() {
            beforeEach(function() {
                var json = fixtures.activityJson({workfile: fixtures.workfileJson(), workspace: fixtures.workspaceJson()});
                this.activity = new chorus.models.Activity(json);
            });

            it("creates an workfile object", function() {
                expect(this.activity.get('workfile')).toBeDefined();
                expect(this.activity.get('workfile')).toBeA(chorus.models.Workfile);
            });

            it("puts the workspaceId into the workfile", function() {
                expect(this.activity.get('workfile').get('workspaceId')).toBe(this.activity.get('workspace').get('id'));
            });
        });
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
        });

        it("returns the same instance when called multiple times", function() {
            expect(this.model.author()).toBe(this.model.author());
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.model.set({
                comments: [
                    {
                        text: "I'm cold.'",
                        author : fixtures.authorJson(),
                        timestamp : "2011-12-15 12:34:56"
                    }
                ],
            });
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments instanceof chorus.models.CommentSet).toBeTruthy();
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
    });

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                artifacts: [fixtures.workfile({ entityType: "workfile" }).attributes, fixtures.artifact().attributes]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles and Artifacts)", function() {
            expect(this.attachments[0] instanceof chorus.models.Workfile).toBeTruthy();
            expect(this.attachments[1] instanceof chorus.models.Artifact).toBeTruthy();
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
