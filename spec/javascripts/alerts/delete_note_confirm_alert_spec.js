describe("chorus.alerts.DeleteNoteConfirmAlert", function() {
    describe("delete confirmation clicked from activity", function () {
        beforeEach(function() {
            this.activity = fixtures.activities.NOTE_ON_WORKSPACE();
            this.collection = new chorus.collections.ActivitySet([this.activity], {entityType: "workspace", entityId: 10000});

            var launchElement = $("<a/>");
            launchElement.data("activity", this.activity);
            this.pageModel = new chorus.models.Base();
            this.alert = new chorus.alerts.DeleteNoteConfirmAlert({launchElement: launchElement, pageModel: this.pageModel});
            this.alert.render()
            this.alert.$('button.submit').click()
        });

        it("destroys a model with the right entityId, entityType, and id", function() {
            expect(this.server.lastDestroy().url).toMatchUrl("/edc/comment/workspace/10000/" + this.activity.id);
        });

        it("sets the alert title correctly", function() {
            expect(this.alert.title).toMatchTranslation("notes.delete.alert.title");
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
    
    describe("delete confirmation clicked from comment", function () {
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
            expect(this.server.lastDestroy().url).toMatchUrl("/edc/comment/workspace/10000/12345");
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