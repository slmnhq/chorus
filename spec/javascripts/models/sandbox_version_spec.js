describe("chorus.models.SandboxVersion", function () {
    beforeEach(function() {
        this.model = new chorus.models.SandboxVersion({ workspaceId : "44"})
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/edc/workspace/44/sandboxDbVersion")
    });
});