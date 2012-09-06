describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfileVersion({
            id: 1,
            versionInfo: {
                versionNum: 2
            }
        });
    });

    describe("url", function() {
        it("has the right backend URL", function() {
            expect(this.model.url()).toBe("/workfiles/1/versions/2");
        });
    });

    describe("destroy", function() {
        it("notifies the page of workfile_version:deleted event", function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.model.destroy();
            this.server.completeDestroyFor(this.model);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile_version:deleted", 2);
        });
    });
});
