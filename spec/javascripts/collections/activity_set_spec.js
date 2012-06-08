describe("chorus.collections.ActivitySet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.ActivitySet([], {
            entityType: "instances",
            entityId: "45"
        });
    });

    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {
            beforeEach(function() {
                this.collection.attributes.insights = true;
            });

            it("returns the url for fetching all insights", function() {
                expect(this.collection.url()).toHaveUrlPath("/commentinsight/");
            });
        });

        context("when the collection does *not* have the 'insights' attribute", function() {
            it("returns the url for fetching all the activities for the entity", function() {
                expect(this.collection.url()).toHaveUrlPath("/instances/45/activities");
            });
        });
    });

    describe(".forDashboard", function() {
        it("creates an activity set with the entity type for the dashboard", function() {
            var activities = chorus.collections.ActivitySet.forDashboard();
            expect(activities.url()).toHaveUrlPath("/activities");
        });
    });
});

