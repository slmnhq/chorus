describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.model = new chorus.models.WorkfileVersion(fixtures.workfileJson({
            workspaceId: '1',
            id: '2',
            versionInfo: {
                versionNum: 3
            }
        }));
    });

    describe("url", function() {
        it("has the right backend URL", function() {
            expect(this.model.url()).toBe("/edc/workspace/1/workfile/2/version/3");
        });
    });

    describe("destroy", function() {
        it("notifies the page of workfile_version:deleted event", function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.model.destroy();
            this.server.completeDestroyFor(this.model);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile_version:deleted", 3);
        });
    });
});
