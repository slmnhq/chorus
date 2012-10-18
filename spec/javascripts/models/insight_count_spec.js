describe("chorus.models.InsightCount", function() {
    beforeEach(function() {
        this.model = new chorus.models.InsightCount();
    });

    context("with an id and action for promote", function() {
        beforeEach(function() {
            this.model = new chorus.models.InsightCount({ noteId: '41', action: "promote" });
        });

        it("has the right url", function() {
            expect(this.model.url()).toBe("/insights/promote");
        });
    });

    context("with an id and action for publish", function() {
        beforeEach(function() {
            this.model = new chorus.models.InsightCount({ noteId: '41', action: "publish" });
        });

        it("has the right url", function() {
            expect(this.model.url()).toBe("/insights/publish");
        });
    });

    describe(".count", function() {
        beforeEach(function() {
            this.insightCount = chorus.models.InsightCount.count({ urlParams: { foo: "bar" }});
        });

        it("returns a model with the right URL", function() {
            expect(this.insightCount).toBeA(chorus.models.Base);

            this.insightCount.fetch();
            expect(this.server.lastFetch().url).toHaveUrlPath("/insights/count");
        });

        it("includes urlParams, if provided", function() {
            expect(this.insightCount.url()).toContainQueryParams({ foo: "bar"})
        })
    });
});
