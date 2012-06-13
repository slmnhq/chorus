describe("chorus.collections.ActivitySet", function() {
    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {
            it("returns the url for fetching all insights", function() {
                this.collection = new chorus.collections.ActivitySet([]);
                this.collection.attributes.insights = true;
                expect(this.collection.url()).toHaveUrlPath("/commentinsight/");
            });
        });
    });

    describe(".forDashboard", function() {
        it("creates an activity set with the entity type for the dashboard", function() {
            var activities = chorus.collections.ActivitySet.forDashboard();
            expect(activities.url()).toHaveUrlPath("/activities");
        });
    });

    describe(".forModel(model)", function() {
        it("throws an exception when the model does not have an entityType mapping", function() {
            var model = new chorus.models.Base();
            expect(function() { model.activities(); }).toThrow();
        });

        describe("the url of the activity set", function() {
            var activities;

            beforeEach(function() {
                var model = new chorus.models.Base();
                spyOn(model, "url").andReturn("/dudes/1?isCool=true");
                activities = chorus.collections.ActivitySet.forModel(model);
            });

            it("is the model's url, with '/activities' appended to the path", function() {
                expect(activities.url()).toHaveUrlPath("/dudes/1/activities");
            });

            it("does not include the query parameters from the model's url", function() {
                expect(activities.url()).not.toContainQueryParams({ isCool: true });
            });
        });

        context("with a HdfsEntry", function() {
            it("doesn't throw an error, even though HdfsEntry doesn't have a url (to keep other specs passing)", function() {
                var model = new chorus.models.HdfsEntry();
                expect(function() {
                    chorus.collections.ActivitySet.forModel(model);
                }).not.toThrow();
            });
        });
    });
});

