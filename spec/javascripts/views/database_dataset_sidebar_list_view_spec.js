describe("chorus.views.DatabaseDatasetSidebarList", function() {
    beforeEach(function() {
        spyOn(chorus.PageEvents, "broadcast").andCallThrough();

        chorus.page = { workspace: newFixtures.workspace({name: "new_workspace"}) };
        this.schema = newFixtures.sandbox().schema();
        this.view = new chorus.views.DatabaseDatasetSidebarList({schema: this.schema});

        stubDefer();
        this.modalSpy = stubModals();
        this.schemaMenuQtip = stubQtip(".context a");
    });

    describe("the schema drop-down menu", function() {
        context("when a schema is selected", function() {
            beforeEach(function() {
                this.view.fetchResourceAfterSchemaSelected();
            });

            it("should fetch all the schemas", function() {
                expect(this.server.lastFetchFor(this.schema.database().schemas())).toBeDefined();
            });

            it("should fetch the schema's tables and views", function() {
                expect(this.schema.databaseObjects()).toHaveBeenFetched();
            });

            context("when the schema fetches complete", function() {
                var datasets, schemas;
                beforeEach(function() {
                    datasets = new chorus.collections.DatasetSet([
                        fixtures.datasetChorusView(),
                        fixtures.datasetSourceTable()
                    ]);
                    schemas = new chorus.collections.SchemaSet([
                        newFixtures.schema({name: "Schema 1"}),
                        newFixtures.schema({name: "Schema 2"})
                    ]);

                    this.server.completeFetchFor(this.view.datasets, datasets.models);
                    this.server.completeFetchFor(this.view.schemas, schemas.models);
                    this.schema.databaseObjects().loaded = true;
                    this.view.render();

                    // Just to get the qtip to exist in the dom
                    this.view.$(".context a").click();
                });

                it("shows all the schemas in the popup menu", function() {
                    expect(this.schemaMenuQtip.find("a").length).toBe(3);
                    expect(this.schemaMenuQtip.find("a").eq(0)).toContainTranslation("database.sidebar.this_workspace");
                    expect(this.schemaMenuQtip.find("a").eq(1)).toContainText("Schema 1");
                    expect(this.schemaMenuQtip.find("a").eq(2)).toContainText("Schema 2");
                });

                describe("clicking on a schema", function() {
                    beforeEach(function() {
                        spyOn(this.view, "fetchResourceAfterSchemaSelected").andCallThrough();
                        this.schemaMenuQtip.$("a:eq(0)").click();
                    });

                    it("re-renders the list of datasets for the new schema", function() {
                        expect(this.view.fetchResourceAfterSchemaSelected).toHaveBeenCalled();
                    });
                });
            });
        });
    });

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
                    this.qtip = stubQtip("li");
                    spyOn(this.view, 'closeQtip');

                    this.server.completeFetchFor(this.schema.databaseObjects(), [
                        fixtures.databaseObject({ objectName: "Data1", type: "SANDBOX_TABLE", objectType: "VIEW" }),
                        fixtures.databaseObject({ objectName: "zebra", type: "SANDBOX_TABLE", objectType: "VIEW" }),
                        fixtures.databaseObject({ objectName: "Data2", type: "SANDBOX_TABLE", objectType: "BASE_TABLE" }),
                        fixtures.databaseObject({ objectName: "1234",  type: "SANDBOX_TABLE", objectType: "BASE_TABLE" })
                    ]);
                    this.view.render();
                });

                jasmine.sharedExamples.DatabaseSidebarList();

                context("when hovering over an li", function() {
                    beforeEach(function() {
                        this.view.$('.list li:eq(1)').mouseenter();
                    });

                    it("has the insert text in the insert arrow", function() {
                        expect(this.qtip.find("a")).toContainTranslation('database.sidebar.insert')
                    })

                    context("when clicking the insert arrow", function() {
                        beforeEach(function() {
                            this.qtip.find("a").click()
                        })

                        it("broadcasts a file:insertText with the string representation", function() {
                            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:insertText", this.view.collection.at(1).toText());
                        })
                    })

                    context("when clicking a link within the li", function() {
                        beforeEach(function() {
                            this.view.$('.list li:eq(1) a').click()
                        })

                        it("closes the open insert arrow", function() {
                            expect(this.view.closeQtip).toHaveBeenCalled();
                        })
                    });

                    context("when scrolling", function() {
                        beforeEach(function() {
                            chorus.page = new chorus.pages.Base();
                            chorus.page.sidebar = new chorus.views.Sidebar();

                            this.view.render();
                            chorus.page.sidebar.trigger("scroll");
                        });

                        it("closes the open insert arrow", function() {
                            expect(this.view.closeQtip).toHaveBeenCalled();
                        });
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
                this.server.lastFetchFor(this.schema.databaseObjects()).fail([
                    {message: "Account map needed"}
                ]);
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
