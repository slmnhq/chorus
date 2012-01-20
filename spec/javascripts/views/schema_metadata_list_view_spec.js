describe("chorus.views.SchemaMetadataList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SchemaMetadataList({ model : fixtures.workfile() });
        this.view.collection = fixtures.tableSet([], {instanceId: "50", databaseName: "partyman", schemaName: "myschema"});
    });

    describe("#render", function() {
        context("before the collection has loaded", function() {
            beforeEach(function() {
                this.view.collection.loaded = false;
                this.view.render();
            })

            it("should display a loading spinner", function() {
                expect(this.view.$(".loading_section")).not.toHaveClass("hidden");
            });
        })

        context("after the collection has loaded", function() {
            beforeEach(function() {
                this.view.collection.loaded = true;
                this.view.render()
            });

            it("renders an li for each item in the collection", function() {
                expect(this.view.$("li").length).toBe(this.view.collection.length);
            });

            context("there are no tables or views in the schema", function() {
                beforeEach(function() {
                    this.view.collection.models = [];
                    this.view.render();
                })
                
                it("should display a message saying there are no tables/views", function() {
                    expect(this.view.$('.empty')).not.toHaveClass("hidden");
                    expect(this.view.$('.empty').text().trim()).toMatchTranslation("schema.metadata.list.empty");
                })
            })
        });
    });
});
