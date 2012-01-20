describe("chorus.views.SchemaMetadataList", function() {
    beforeEach(function() {
        this.sandbox = fixtures.sandbox();
        this.schema = this.sandbox.schema();

        spyOn(this.schema.views(), "fetch").andCallThrough();
        spyOn(this.schema.tables(), "fetch").andCallThrough();

        this.view = new chorus.views.SchemaMetadataList({sandbox: this.sandbox});
    });

    it("should fetch the list of tables", function() {
        expect(this.schema.tables().fetch).toHaveBeenCalled();
    });

    it("should fetch the list of views", function() {
        expect(this.schema.views().fetch).toHaveBeenCalled();
    });

    context("when the table fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.view.tables, [fixtures.table(), fixtures.table()]);
        });

        it("should set the list of tables in the collection", function() {
            expect(this.view.tables.length).toBe(2);
            expect(this.view.collection.length).toBe(this.view.tables.length);
        });
    });

    context("when the view fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.view.views,  [fixtures.databaseView(), fixtures.databaseView()]);
        });

        it("should set the list of views in the collection", function() {
            expect(this.view.views.length).toBe(2);
            expect(this.view.collection.length).toBe(this.view.views.length);
        });
    });

    describe("#render", function() {
        context("before the tables or views have loaded", function() {
            beforeEach(function() {
                this.view.views.loaded = false;
                this.view.tables.loaded = false;
                this.view.render();
            })

            it("should display a loading spinner", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        })

        context("after only the table fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.tables, [fixtures.table(), fixtures.table()]);
            })

            it("still displays a loading spinner", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        });

        context("after only the view fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.views, [fixtures.databaseView(), fixtures.databaseView()]);
            });

            it("still displays a loading spinner", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        });

        context("after both fetches have completed", function() {
            beforeEach(function() {
                this.view.views.loaded = true;
                this.view.tables.loaded = true;
            });

            it("doesn't display a loading spinner", function() {
                expect(this.view.$(".loading_section")).not.toExist();
            });

            context("and some data was fetched", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.view.views, [fixtures.databaseView(), fixtures.databaseView()]);
                    this.server.completeFetchFor(this.view.tables, [fixtures.table(), fixtures.table()]);
                    this.view.render();
                });

                it("should not display the loading spinner", function() {
                    expect(this.view.$(".loading_section")).not.toExist();
                });

                it("renders an li for each item in the collection", function() {
                    expect(this.view.$("li").length).toBe(this.view.collection.length);
                });

                it("should not display a message saying there are no tables/views", function() {
                    expect(this.view.$('.empty')).toHaveClass("hidden");
                });
            });

            context("and no data was fetched", function() {
                beforeEach(function() {
                    this.view.collection.models = [];
                    this.view.render();
                });

                it("should display a message saying there are no tables/views", function() {
                    expect(this.view.$('.empty')).not.toHaveClass("hidden");
                    expect(this.view.$('.empty').text().trim()).toMatchTranslation("schema.metadata.list.empty");
                })
            });
        });
    });
});
