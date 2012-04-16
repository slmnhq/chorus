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
                    schemas = new chorus.collections.SchemaSet([
                        newFixtures.schema({name: "Schema 1"}),
                        newFixtures.schema({name: "Schema 2"})
                    ]);

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

                describe("searching for a dataset", function() {
                    beforeEach(function() {
                        this.server.reset();
                        this.view.$("input.search").val("foo").trigger("keyup");
                    });

                    it("should re-fetch the collection using the search parameters", function() {
                        expect(this.server.lastFetch().url).toContainQueryParams({filter: "foo"});
                    });

                    context("when the fetch completes", function() {
                        beforeEach(function() {
                            spyOn($.fn, "draggable").andCallThrough();
                            spyOn(this.view.listview, "render");
                            this.server.lastFetch().succeed();
                        });

                        it("makes items draggable", function() {
                            expect($.fn.draggable).toHaveBeenCalled();
                        });
                    });
                });

                describe("fetching more datasets", function() {
                    beforeEach(function() {
                        spyOn(this.view.listview, "render");
                        spyOn(this.view, "postRender");
                        this.view.collection.pagination = {page: 1, total:2, records:51};
                        this.server.reset();
                        this.view.listview.trigger('fetch:more');

                    });

                    it("fetches more of the collection", function() {
                       expect(this.server.lastFetch().url).toContainQueryParams({page: 2});
                    });

                    context("when the fetch succeeds", function() {
                        beforeEach(function() {
                            spyOn($.fn, "draggable").andCallThrough();
                            this.view.listview.render.reset();
                            this.server.lastFetch().succeed();
                        });

                        it("renders the list view", function() {
                            expect(this.view.listview.render).toHaveBeenCalled();
                            expect(this.view.postRender).toHaveBeenCalled();
                        });

                        it("makes items draggable", function() {
                            expect($.fn.draggable).toHaveBeenCalled();
                        });
                    });
                });
            });
        });

        context("when the 'this workspace' schema is selected", function() {
            context("and there is a focus schema", function() {
                beforeEach(function() {
                    this.view.focusSchema = this.schema;
                    this.view.setSchemaToCurrentWorkspace();
                    this.view.fetchResourceAfterSchemaSelected();
                });

                it("fetches all the datasets in the workspace, scoped to the database of the focus schema", function() {
                    var datasetSet = new chorus.collections.DatasetSet([], { workspaceId: chorus.page.workspace.get("id") })
                    datasetSet.sortAsc("objectName");
                    datasetSet.urlParams = {
                        databaseName: this.view.focusSchema.get("databaseName")
                    }

                    expect(this.server.lastFetchFor(datasetSet)).toBeDefined();
                });

                it("does not sort the datasets on the client side", function() {
                    expect(this.view.collection.attributes.unsorted).toBeTruthy();
                });
            });

            context("and there is no focus schema", function() {
                beforeEach(function() {
                    delete this.view.focusSchema;
                    this.view.setSchemaToCurrentWorkspace();
                    this.view.fetchResourceAfterSchemaSelected();
                });

                it("fetches all the datasets in the workspace", function() {
                    var datasetSet = new chorus.collections.DatasetSet([], { workspaceId: chorus.page.workspace.get("id") })
                    datasetSet.sortAsc("objectName")
                    expect(this.server.lastFetchFor(datasetSet)).toBeDefined();
                });

                it("does not sort the datasets on the client side", function() {
                    expect(this.view.collection.attributes.unsorted).toBeTruthy();
                });
            })
        });
    });

    context("when there's no schema associated", function() {
        beforeEach(function() {
            this.view = new chorus.views.DatabaseDatasetSidebarList({schema: null});
            this.view.render();
        });

        it("should display 'no database/schema associated' message", function() {
            expect(this.view.$(".empty_selection")).toExist();
        });

        it("should not display the loading section", function() {
            expect(this.view.$(".loading_section")).not.toExist();
        });
    });

    context("when there's sandbox/default schema associated", function() {
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

                    this.server.completeFetchFor(this.schema.database().schemas());
                });

                jasmine.sharedExamples.DatabaseSidebarList();

                context("when hovering over an li", function() {
                    beforeEach(function() {
                        this.view.$('.list li:eq(1)').mouseenter();
                    });

                    it("has the insert text in the insert arrow", function() {
                        expect(this.qtip.find("a")).toContainTranslation('database.sidebar.insert');
                    });

                    context("when clicking the insert arrow", function() {
                        beforeEach(function() {
                            this.qtip.find("a").click();
                        });

                        it("broadcasts a file:insertText with the string representation", function() {
                            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:insertText", this.view.collection.at(1).toText());
                        });
                    });

                    context("when clicking a link within the li", function() {
                        beforeEach(function() {
                            this.view.$('.list li:eq(1) a').click();
                        });

                        it("closes the open insert arrow", function() {
                            expect(this.view.closeQtip).toHaveBeenCalled();
                        });
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
                    this.server.completeFetchFor(this.schema.database().schemas(), []);
                    this.view.collection.models = [];
                    this.view.render();
                });

                it("should display a message saying there are no tables/views", function() {
                    expect(this.view.$('.none_found')).toExist();
                    expect(this.view.$('.none_found').text().trim()).toMatchTranslation("schema.metadata.list.empty");
                });
            });
        });

        context("if the tables and views fetch fails", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.schema.database().schemas());
                this.server.lastFetchFor(this.schema.databaseObjects()).fail([
                    {message: "Account map needed"}
                ]);
                this.view.render();
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

    describe("after workfile execution", function() {
        beforeEach(function() {
            this.executionSchema = newFixtures.sandbox().schema();
            chorus.PageEvents.broadcast("workfile:executed", fixtures.workfile(), this.executionSchema)
        });

        it("updates focusSchema", function() {
            expect(this.view.focusSchema.canonicalName()).toBe(this.executionSchema.canonicalName())
        });
    });
});
