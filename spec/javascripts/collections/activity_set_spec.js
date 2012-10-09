describe("chorus.collections.ActivitySet", function() {
    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {

            context("and collection is for the dashboard", function() {
                it("returns the url for fetching all insights", function() {
                    this.collection = new chorus.collections.ActivitySet([]);
                    this.collection.attributes.insights = true;
                    expect(this.collection.url()).toHaveUrlPath("/insights");
                    expect(this.collection.url()).toContainQueryParams({entity_type : "dashboard"})
                });
            });

            context("and collection is for a workspace", function() {
                it("returns the url for fetching insights belonging to a workspace", function() {
                    this.collection = new chorus.collections.ActivitySet([]);
                    this.collection.attributes.insights = true;
                    this.collection.attributes.workspace = { id: 21 }
                    expect(this.collection.url()).toHaveUrlPath("/insights");
                    expect(this.collection.url()).toContainQueryParams({entity_type : "workspace", workspace_id: 21})
                });
            });
        });
    });

    describe(".forDashboard", function() {
        it("creates an activity set with the entity type for the dashboard", function() {
            var activities = chorus.collections.ActivitySet.forDashboard();
            expect(activities.url()).toHaveUrlPath("/activities");
            expect(activities.url()).toContainQueryParams({entity_type : "dashboard"})
        });
    });

    describe(".forModel(model)", function() {
        describe("the url of the activity set", function() {
            var activities, model;

            context("for a hdfs model type", function () {
                beforeEach(function() {
                    model = fixtures.hdfsFile({
                        id: 8789,
                        hadoopInstance : { id : 1 },
                        path : "/data",
                        name : "test.csv"
                    });

                    activities = chorus.collections.ActivitySet.forModel(model);
                });

                it("includes the entity_type, the ", function() {
                    expect(activities.url()).toContain("/activities?entity_type=hdfs_file&entity_id=8789" );
                });
            });

            context("for a non-hdfs model type", function () {
                beforeEach(function() {
                    model = new chorus.models.Base({id: 1});
                    model.entityType = "hello";
                    activities = chorus.collections.ActivitySet.forModel(model);
                });
                it("includes the entity_type and the id of the model", function() {
                    expect(activities.url()).toContain("/activities?entity_type=hello&entity_id=" + model.id );
                });
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

