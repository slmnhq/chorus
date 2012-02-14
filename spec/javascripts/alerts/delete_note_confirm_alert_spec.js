describe("chorus.alerts.DeleteNoteConfirmAlert", function() {
    describe("delete confirmation clicked", function () {
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