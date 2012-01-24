describe("chorus.views.DatabaseDatasetList", function() {
    beforeEach(function() {
        this.sandbox = fixtures.sandbox();
        this.schema = this.sandbox.schema();

        spyOn(this.schema.views(), "fetch").andCallThrough();
        spyOn(this.schema.tables(), "fetch").andCallThrough();

        this.view = new chorus.views.DatabaseDatasetList({sandbox: this.sandbox});
    });

    it("should fetch the list of tables", function() {
        expect(this.schema.tables().fetch).toHaveBeenCalled();
    });

    it("should fetch the list of views", function() {
        expect(this.schema.views().fetch).toHaveBeenCalled();
    });

    context("when the table fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.view.tables, [fixtures.databaseTable(), fixtures.databaseTable()]);
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
                this.server.completeFetchFor(this.view.tables, [fixtures.databaseTable(), fixtures.databaseTable()]);
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
                    this.server.completeFetchFor(this.view.views, [
                        fixtures.databaseView({name: "Data1"}),
                        fixtures.databaseView({name: "zebra"})
                    ]);
                    this.server.completeFetchFor(this.view.tables, [
                        fixtures.databaseTable({name: "Data2"}),
                        fixtures.databaseTable({name: "apple"})
                    ]);
                    this.view.render();
                });

                it("should not display the loading spinner", function() {
                    expect(this.view.$(".loading_section")).not.toExist();
                });

                it("renders an li for each item in the collection", function() {
                    expect(this.view.$("li").length).toBe(this.view.collection.length);
                });

                it("sorts the data by name", function() {
                    expect(this.view.$("li").eq(0).text().trim()).toBe("apple");
                    expect(this.view.$("li").eq(1).text().trim()).toBe("Data1");
                    expect(this.view.$("li").eq(2).text().trim()).toBe("Data2");
                    expect(this.view.$("li").eq(3).text().trim()).toBe("zebra");
                });

                it("should not display a message saying there are no tables/views", function() {
                    expect(this.view.$('.none_found')).not.toExist();
                });

                describe("user clicks a view in the list", function() {
                    beforeEach(function() {
                        this.clickedView = this.view.views.findByName("Data1");
                        spyOnEvent(this.view, "datasetSelected");
                        this.view.$("li:contains('Data1') a").click();
                    });

                    it("triggers a 'datasetSelected' event on itself, with the view", function() {
                        expect("datasetSelected").toHaveBeenTriggeredOn(this.view, [this.clickedView]);
                    });
                });

                describe("user clicks on a table in the list", function() {
                    beforeEach(function() {
                        this.clickedTable = this.view.tables.findByName("Data2");
                        spyOnEvent(this.view, "datasetSelected");
                        this.view.$("li:contains('Data2') a").click();
                    });

                    it("triggers a 'datasetSelected' event on itself, with the table", function() {
                        expect("datasetSelected").toHaveBeenTriggeredOn(this.view, [this.clickedTable]);
                    });
                });
            });

            context("and no data was fetched", function() {
                beforeEach(function() {
                    this.view.collection.models = [];
                    this.view.render();
                });

                it("should display a message saying there are no tables/views", function() {
                    expect(this.view.$('.none_found')).toExist();
                    expect(this.view.$('.none_found').text().trim()).toMatchTranslation("schema.metadata.list.empty");
                })
            });
        });
    });
});
