describe("chorus.models.InstanceUsage", function() {
    beforeEach(function() {
        this.usage = fixtures.instanceUsage()
        this.workspaces = this.usage.get('workspaces')
    })

    describe("#calculatePercentages", function() {
        beforeEach(function() {
            this.config = chorus.models.Config.instance();
            this.server.completeFetchFor(this.config, fixtures.configJson());
            this.usage.calculatePercentages()
        })

        it("should have a used percentage for each workspace", function() {
            _.each(this.workspaces, _.bind(function(workspace) {
                var expectedPercentDecimal = parseInt(workspace.sizeInBytes, 10) / this.config.get('sandboxRecommendSizeInBytes')
                var expectedPercent = Math.round(expectedPercentDecimal * 100);
                expect(workspace.percentageUsed).toBe(expectedPercent);
            }, this))
        })
    });

    describe("workspaceCount", function() {
        it("returns the number of workspaces in which the instance is used", function() {
            this.usage.set({ workspaces: [{}, {}, {}] })
            expect(this.usage.workspaceCount()).toBe(3);
        });

        it("returns undefined when the model doesn't have a 'workspaces' attribute", function() {
            this.usage.unset("workspaces");
            expect(this.usage.workspaceCount()).toBeUndefined();
        });
    });
});
