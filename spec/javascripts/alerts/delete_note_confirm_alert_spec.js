describe("chorus.alerts.DeleteNoteConfirmAlert", function() {
    describe("delete confirmation clicked from activity", function() {
        beforeEach(function() {
            this.activity = fixtures.activities.NOTE_ON_WORKSPACE();
            this.collection = new chorus.collections.ActivitySet([this.activity], {entityType: "workspace", entityId: 10000});
            this.launchElement = $("<a/>");
            this.launchElement.data("activity", this.activity);
            this.pageModel = new chorus.models.Base();
            this.alert = new chorus.alerts.DeleteNoteConfirmAlert({launchElement: this.launchElement, pageModel: this.pageModel});
            this.alert.render()
            this.alert.$('button.submit').click()
        })

        it("destroys a model with the right entityId, entityType, and id", function() {
            expect(this.server.lastDestroy().url).toMatchUrl("/comment/workspace/10000/" + this.activity.id);
        });

        describe("when the delete succeeds", function() {
            beforeEach(function() {
                spyOnEvent(this.pageModel, "invalidated");
                spyOn(chorus, "toast")
                this.server.lastDestroy().succeed();
            });

            it("triggers invalidated on the pageModel", function() {
                expect("invalidated").toHaveBeenTriggeredOn(this.pageModel);
            });

            it("shows a toast message", function() {
                expect(chorus.toast).toHaveBeenCalledWith(this.alert.deleteMessage, undefined);
            })
        });

        describe("when the activity is a NOTE", function() {
            it("sets the alert title correctly", function() {
                expect(this.alert.title).toMatchTranslation("notes.delete.alert.title");
            });

            it("sets the text correctly", function() {
                expect(this.alert.text).toMatchTranslation("notes.delete.alert.text");
            })

            it("sets the ok button text correctly", function() {
                expect(this.alert.ok).toMatchTranslation("notes.delete.alert.ok");
            })

            it("sets the delete message correctly", function() {
                expect(this.alert.deleteMessage).toBe("notes.delete.alert.delete_message");
            })
        });

        describe("when the activity is an INSIGHT", function() {
            beforeEach(function() {
                this.activity = fixtures.activities.INSIGHT_CREATED();
                this.collection = new chorus.collections.ActivitySet([this.activity], {entityType: "workspace", entityId: 10000});
                this.launchElement.data("activity", this.activity);
                this.alert = new chorus.alerts.DeleteNoteConfirmAlert({launchElement: this.launchElement, pageModel: this.pageModel});
                this.alert.render()
                this.alert.$('button.submit').click()
            });

            it("sets the alert title correctly", function() {
                expect(this.alert.title).toMatchTranslation("insight.delete.alert.title");
            });

            it("sets the text correctly", function() {
                expect(this.alert.text).toMatchTranslation("insight.delete.alert.text");
            })

            it("sets the ok button text correctly", function() {
                expect(this.alert.ok).toMatchTranslation("insight.delete.alert.ok");
            })

            it("sets the delete message correctly", function() {
                expect(this.alert.deleteMessage).toBe("insight.delete.alert.delete_message");
            })
        });
    })

    describe("delete confirmation clicked from comment", function() {
        beforeEach(function() {
            var launchElement = $("<a/>");
            launchElement.data("entityId", 10000);
            launchElement.data("entityType", "workspace");
            launchElement.data("commentId", 12345);
            this.pageModel = new chorus.models.Base();
            this.alert = new chorus.alerts.DeleteNoteConfirmAlert({launchElement: launchElement, pageModel: this.pageModel});
            this.alert.render()
            this.alert.$('button.submit').click()
        });

        it("destroys a model with the right entityId, entityType, and id", function() {
            expect(this.server.lastDestroy().url).toMatchUrl("/comment/workspace/10000/12345");
        });

        it("sets the alert title correctly", function() {
            expect(this.alert.title).toMatchTranslation("comments.delete.alert.title");
        });

        describe("when the delete succeeds", function() {
            beforeEach(function() {
                spyOnEvent(this.pageModel, "invalidated");
                this.server.lastDestroy().succeed();
            });

            it("triggers invalidated on the pageModel", function() {
                expect("invalidated").toHaveBeenTriggeredOn(this.pageModel);
            });
        });
    })
});