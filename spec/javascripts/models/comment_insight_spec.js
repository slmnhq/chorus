describe("chorus.models.CommentInsight", function() {
    beforeEach(function() {
        this.model = new chorus.models.CommentInsight();
    });

    context("with an id and action", function() {
        beforeEach(function() {
            this.model = new chorus.models.CommentInsight({ id: '41', action: "promote" });
        });

        it("has the right url", function() {
            expect(this.model.url()).toBe("/edc/commentinsight/41/promote");
        });
    });

    describe(".count", function() {
        beforeEach(function() {
            this.insightCount = chorus.models.CommentInsight.count({ urlParams: { foo: "bar" }});
        });

        it("returns a model with the right URL", function() {
            expect(this.insightCount).toBeA(chorus.models.Base);

            this.insightCount.fetch();
            expect(this.server.lastFetch().url).toHaveUrlPath("/edc/commentinsight/count");
        });

        it("includes urlParams, if provided", function() {
            expect(this.insightCount.url()).toContainQueryParams({ foo: "bar"})
        })
    });
});
