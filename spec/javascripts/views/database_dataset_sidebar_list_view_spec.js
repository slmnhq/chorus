describe("chorus.views.DatabaseDatasetSidebarList", function() {
    beforeEach(function() {
        var sandbox = fixtures.sandbox();
        this.schema = sandbox.schema();
        this.modalSpy = stubModals();
        this.view = new chorus.views.DatabaseDatasetSidebarList({schema: this.schema});
        stubDefer();
    });

    describe("when a schema is selected (which calls #fetchResourceAfterSchemaSelected)", function() {
        beforeEach(function() {
            this.schema2 = fixtures.schema();
            this.view.schema = this.schema2;
            this.view.fetchResourceAfterSchemaSelected();
        });

        it("should fetch the schema's tables and views", function() {
            expect(this.schema2.databaseObjects()).toHaveBeenFetched();
        });

        describe("when the fetch for the tables and views completes", function() {
            beforeEach(function() {
                spyOn(this.view, 'postRender');
                this.server.completeFetchFor(this.schema2.databaseObjects(), [
                    fixtures.databaseObject({ objectType: "SANDBOX_TABLE" }),
                    fixtures.databaseObject({ objectType: "VIEW"})
                ]);
            });

            it("re-renders", function() {
                expect(this.view.postRender).toHaveBeenCalled();
            });
        });
    });

    describe("#render", function() {
        context("when there's no schema associated", function() {
            beforeEach(function() {
                this.view.schema = null;
                this.view.render();
            });

            it("should display 'no database/schema associated' message", function() {
                expect(this.view.$(".empty_selection")).toExist();
            })

            it("should not display the loading section", function() {
                expect(this.view.$(".loading_section")).not.toExist();
            })
        });

        context("when there's sandbox/default schema associated", function() {
            context("before the tables and views have loaded", function() {
                beforeEach(function() {
                    this.schema.databaseObjects().loaded = false;
                    this.view.render();
                })

                it("should not display the 'no database/schema associated' message", function() {
                    expect(this.view.$(".empty_selection")).not.toExist();
                });

                it("should display a loading spinner", function() {
                    expect(this.view.$(".loading_section")).toExist();
                });
            });

            context("after the tables and views are loaded", function() {
                beforeEach(function() {
                    this.schema.databaseObjects().loaded = true;
                });

                it("doesn't display a loading spinner", function() {
                    expect(this.view.$(".loading_section")).not.toExist();
                });

                context("and some data was fetched", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.schema.databaseObjects(), [
                            fixtures.databaseObject({ objectName: "Data1", type: "SANDBOX_TABLE", objectType: "VIEW" }),
                            fixtures.databaseObject({ objectName: "zebra", type: "SANDBOX_TABLE", objectType: "VIEW"}),
                            fixtures.databaseObject({ objectName: "Data2", type: "SANDBOX_TABLE", objectType: "BASE_TABLE" }),
                            fixtures.databaseObject({ objectName: "apple", type: "SANDBOX_TABLE", objectType: "BASE_TABLE"})
                        ]);
                        this.view.render();
                    });

                    jasmine.sharedExamples.DatabaseSidebarList();

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

                    it("renders the correct data-fullname for each item", function() {
                        expect(this.view.$("li").eq(0).data("fullname")).toBe("schema_name.apple");
                        expect(this.view.$("li").eq(1).data("fullname")).toBe('schema_name."Data1"');
                        expect(this.view.$("li").eq(2).data("fullname")).toBe('schema_name."Data2"');
                        expect(this.view.$("li").eq(3).data("fullname")).toBe("schema_name.zebra");
                    });

                    it("renders appropriate icon for each item in the collection", function() {
                        var $lisAlphabeticallySorted = this.view.$("li");
                        expect($lisAlphabeticallySorted.eq(0).find("img").attr("src")).toContain("sandbox_table_medium.png");
                        expect($lisAlphabeticallySorted.eq(1).find("img").attr("src")).toContain("sandbox_view_medium.png");
                        expect($lisAlphabeticallySorted.eq(2).find("img").attr("src")).toContain("sandbox_table_medium.png");
                        expect($lisAlphabeticallySorted.eq(3).find("img").attr("src")).toContain("sandbox_view_medium.png");
                    });

                    it("should not display a message saying there are no tables/views", function() {
                        expect(this.view.$('.none_found')).not.toExist();
                    });

                    describe("user clicks a view in the list", function() {
                        beforeEach(function() {
                            this.clickedView = this.schema.databaseObjects().findWhere({ objectName: "Data1" });
                            spyOnEvent(this.view, "datasetSelected");
                            this.view.$("li:contains('Data1') a").click();
                        });

                        it("triggers a 'datasetSelected' event on itself, with the view", function() {
                            expect("datasetSelected").toHaveBeenTriggeredOn(this.view, [this.clickedView]);
                        });
                    });

                    describe("user clicks on a table in the list", function() {
                        beforeEach(function() {
                            this.clickedTable = this.schema.databaseObjects().findWhere({ objectName: "Data2" });
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

            context("if the tables and views fetch fails", function() {
                beforeEach(function() {
                    this.server.lastFetchFor(this.schema.databaseObjects()).fail([{message: "Account map needed"}]);
                    this.view.render();
                });

                it("should not display the loading spinner", function() {
                    expect(this.view.$(".loading_section")).not.toExist();
                });

                it("should display an option to enter credentials", function() {
                    expect(this.view.$('.no_credentials')).toExist();
                });

                it("launches the correct dialog when the 'click here' credentials link is clicked", function() {
                    this.view.$('.no_credentials .add_credentials').click();
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.InstanceAccount);
                });
            });

        });

    });
});
