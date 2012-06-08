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

        it("the Url for activities is model's url + /activities", function() {
            var user = new chorus.models.User({id: 2});
            var instance = new chorus.models.GreenplumInstance({id: 45});
            var userActivities = chorus.collections.ActivitySet.forModel(user);
            var instanceActivities = chorus.collections.ActivitySet.forModel(instance);

            expect(userActivities.url()).toHaveUrlPath("/users/2/activities")
            expect(instanceActivities.url()).toHaveUrlPath("/instances/45/activities");
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

