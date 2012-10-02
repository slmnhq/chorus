describe("chorus.models.InstanceUsage", function() {
    beforeEach(function() {
        this.usage = rspecFixtures.instanceDetails();
        this.workspaces = this.usage.get('workspaces');
    });

    describe("workspaceCount", function() {
        it("returns the number of workspaces in which the instance is used", function() {
            this.usage.set({ workspaces: [{}, {}, {}] });
            expect(this.usage.workspaceCount()).toBe(3);
        });

        it("returns undefined when the model doesn't have a 'workspaces' attribute", function() {
            this.usage.unset("workspaces");
            expect(this.usage.workspaceCount()).toBeUndefined();
        });
    });
});
