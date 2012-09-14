describe("chorus.alerts.DeleteNoteConfirmAlert", function() {
    describe("delete confirmation clicked from activity", function() {
        beforeEach(function() {
            this.activity = rspecFixtures.activity.noteOnGreenplumInstanceCreated();
            this.collection = new chorus.collections.ActivitySet([this.activity], {entityType: "workspace", entityId: 10000});
            this.pageModel = new chorus.models.Base();
            this.alert = new chorus.alerts.DeleteNoteConfirmAlert({ activity: this.activity, pageModel: this.pageModel});
            this.alert.render()
            this.alert.$('button.submit').click()
        })

        it("destroys a model with the right entityId, entityType, and id", function() {
            var note = this.activity.toNote();
            expect(this.server.lastDestroy().url).toMatchUrl(note.url());
        });

        describe("when the delete succeeds", function() {
            beforeEach(function() {
                spyOn(chorus, "toast");
                spyOn(this.collection, "url").andReturn("abc");
                this.server.lastDestroy().succeed();
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

            it("should not displays the note's body", function () {
                expect(this.alert.$(".body p").text()).toBe("");
            });

        });

        describe("when the activity is an INSIGHT", function() {
            beforeEach(function() {
                this.activity = fixtures.activities.INSIGHT_CREATED();
                this.collection = new chorus.collections.ActivitySet([this.activity], {entityType: "workspace", entityId: 10000});
                this.alert = new chorus.alerts.DeleteNoteConfirmAlert({ activity: this.activity, pageModel: this.pageModel});
                this.alert.render()
                this.alert.$('button.submit').click()
            });

            it("sets the alert title correctly", function() {
                expect(this.alert.title).toMatchTranslation("insight.delete.alert.title");
            });

            it("sets the text correctly", function() {
                expect(this.alert.text).toMatchTranslation("insight.delete.alert.text");
            });

            it("sets the ok button text correctly", function() {
                expect(this.alert.ok).toMatchTranslation("insight.delete.alert.ok");
            });

            it("sets the delete message correctly", function() {
                expect(this.alert.deleteMessage).toBe("insight.delete.alert.delete_message");
            });
        });
    });

    describe("delete confirmation clicked from comment", function() {
        beforeEach(function() {
            this.pageModel = new chorus.models.Base();
            this.alert = new chorus.alerts.DeleteNoteConfirmAlert({
                entityId: 10000,
                entityType: "workspace",
                commentId: 12345,
                pageModel: this.pageModel
            });
            this.alert.render();
            this.alert.$('button.submit').click();
        });

        it("destroys a model with the right entityId, entityType, and id", function() {
            expect(this.server.lastDestroy().url).toMatchUrl("/comments/12345");
        });

        it("sets the alert title correctly", function() {
            expect(this.alert.title).toMatchTranslation("comments.delete.alert.title");
        });
    });
});
