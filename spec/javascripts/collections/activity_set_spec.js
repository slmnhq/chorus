describe("chorus.collections.ActivitySet", function() {
    beforeEach(function() {
        fixtures.model = 'ActivitySet';
        this.collection = new chorus.collections.ActivitySet([], {
            entityType: "workspace",
            entityId: "45"
        });
    });

    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {
            beforeEach(function() {
                this.collection.attributes.insights = true;
            });

            it("returns the url for fetching all insights", function() {
                expect(this.collection.url()).toHaveUrlPath("/edc/commentinsight/");
            });
        });

        context("when the collection does *not* have the 'insights' attribute", function() {
            it("returns the url for fetching all the activities for the entity", function() {
                expect(this.collection.url()).toHaveUrlPath("/edc/activitystream/workspace/45");
            });
        });
    });

    describe("#filterInsights", function() {
        it("re-fetches the collection using the insight API", function() {
            this.collection.filterInsights();

            expect(this.collection.url()).toHaveUrlPath("/edc/commentinsight/");
            expect(this.collection).toHaveBeenFetched();
        });
    });

    describe("#filterAll", function() {
        it("re-fetches the collection using the normal activity stream API (not the insight API)", function() {
            this.collection.filterAll();
            expect(this.collection.url()).toHaveUrlPath("/edc/activitystream/workspace/45");
            expect(this.collection).toHaveBeenFetched();
        });
    });
});

