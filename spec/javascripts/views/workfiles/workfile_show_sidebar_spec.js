describe("chorus.views.WorkfileShowSidebar", function() {
    beforeEach(function() {
        this.workfile = fixtures.textWorkfile();
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("initialization", function() {
        it("has a SidebarActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        })

        it("fetches the ActivitySet for the workfile", function() {
            expect(this.server.requests[0].url).toBe("/edc/activitystream/workfile/" + this.workfile.get('id') + "?page=1&rows=50");
            expect(this.server.requests[0].method).toBe("GET");
        })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("should show the loading section", function() {
            expect(this.view.$('.loading_section')).toExist();
        });
    });

    context("with a sql workfile", function() {
        beforeEach(function() {
            this.workfile = fixtures.sqlWorkfile();
            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });

            this.view.model.fetch();
            this.view.model.workspace().fetch();

            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.workspace(), fixtures.workspace({
                sandboxInfo : {
                    databaseId: 4,
                    databaseName: "db",
                    instanceId: 5,
                    instanceName: "instance",
                    sandboxId: "10001",
                    schemaId: 6,
                    schemaName: "schema"
                }
            }));
        });

        describe("render", function() {

            beforeEach(function() {
                this.view.render();
            });

            it("displays a link to copy the workfile to another workspace", function() {
                var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
                expect(copyLink).toExist();
                expect(copyLink).toHaveAttr("data-workspace-id", this.view.model.get("workspaceId"))
                expect(copyLink).toHaveAttr("data-workfile-id", this.view.model.get("id"))
            })

            it("should have an activities tab", function() {
                expect(this.view.$('.tab_control .activity_list')).toExist();
            });

            it("should have a functions tab", function() {
                expect(this.view.$('.tab_control .database_function_list')).toExist();
            });

            it("should have a dataset tab", function() {
                expect(this.view.$('.tab_control .datasets_and_columns')).toExist();
            });

            it("renders the functions subview", function() {
                expect(this.view.functionList).toBeA(chorus.views.DatabaseFunctionSidebarList);
            });

            it("renders selected version", function() {
                expect(this.view.$(".chosen").text()).toMatchTranslation("workfile.version_title", {versionNum: this.view.model.get("versionInfo").versionNum})
            })

            context("when the dataset tab is selected", function() {
                beforeEach(function() {
                    this.view.$(".tab_control .database_dataset_list").click();
                    this.server.completeAllFetches();
                    this.view.$(".database_dataset_list input.search").val("searching for a table...");
                });

                it("shows the dataset list view", function() {
                    expect(this.view.$(".database_dataset_list")).not.toHaveClass("hidden");
                });

                it("hides the column list view", function() {
                    expect(this.view.$(".database_column_list")).toHaveClass("hidden");
                });

                context("when a table is selected in the dataset list", function() {
                    beforeEach(function() {
                        this.table = fixtures.databaseTable();
                        spyOnEvent(this.view.columnList, 'datasetSelected');
                        this.view.datasetList.trigger("datasetSelected", this.table);
                        this.server.completeAllFetches();
                        this.view.$(".database_column_list input.search").val("searching for a column...");
                    });

                    it("hides the metadata list", function() {
                        expect(this.view.$(".database_dataset_list")).toHaveClass("hidden");
                    });

                    it("shows the column list", function() {
                        expect(this.view.$(".database_column_list")).not.toHaveClass("hidden");
                    });

                    it("forwards the selection event to the column list view", function() {
                        expect("datasetSelected").toHaveBeenTriggeredOn(this.view.columnList, [ this.table ]);
                    });

                    context("when the back link is clicked", function() {
                        beforeEach(function() {
                            this.view.columnList.trigger("back");
                        });

                        it("clears the search text", function() {
                            expect(this.view.$(".database_dataset_list input.search").val()).toBe("");
                        });

                        it("should hide the column list", function() {
                            expect(this.view.$(".database_column_list")).toHaveClass("hidden");
                        });

                        it("should show the dataset list", function() {
                            expect(this.view.$(".database_dataset_list")).not.toHaveClass("hidden");
                        });

                        describe("clicking a table again", function() {
                            beforeEach(function() {
                                this.view.$(".tab_control .database_dataset_list").click();
                                this.server.completeAllFetches();
                            });

                            it("clears the search text for the columns", function() {
                                expect(this.view.$(".database_column_list input.search").val()).toBe("");
                            });
                        });
                    });
                });
            });
        });
    });

    context("with a non-sql workfile", function() {
        beforeEach(function() {
            this.workfile = fixtures.textWorkfile({
                lastUpdatedStamp: "2011-11-22 10:46:03.152"
            });
            expect(this.workfile.isText()).toBeTruthy();

            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });

            this.view.model.fetch();
            this.view.model.workspace().fetch();

            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.workspace(), fixtures.workspace({
                sandboxInfo : {
                    databaseId: 4,
                    databaseName: "db",
                    instanceId: 5,
                    instanceName: "instance",
                    sandboxId: "10001",
                    schemaId: 6,
                    schemaName: "schema"
                }
            }));
        });

        describe("render", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("should not have function or dataset tabs", function() {
                expect(this.view.$('.tab_control .activity_list')).toExist();
                expect(this.view.$('.tab_control .database_function_list')).not.toExist();
                expect(this.view.$('.tab_control .database_dataset_list')).not.toExist();
            });

            it("displays a link to copy the workfile to another workspace", function() {
                var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
                expect(copyLink).toExist();
                expect(copyLink).toHaveAttr("data-workspace-id", this.workfile.get("workspaceId"))
                expect(copyLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
            })

            it("displays the filename", function() {
                expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
            });

            it("displays the workfile's date", function() {
                expect(this.view.$(".updated_on").text().trim()).toBe("November 22");
            });

            it("displays the name of the person who updated the workfile", function() {
                var updaterName = this.workfile.get("modifiedByFirstName") + " " + this.workfile.get("modifiedByLastName");
                expect(this.view.$(".updated_by").text().trim()).toBe(updaterName);
            });

            it("links to the profile page of the modifier", function() {
                expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("modifiedById"))
            })

            it("displays a link to download the workfile", function() {
                expect(this.view.$(".actions a.download")).toHaveAttr("href", "/edc/workspace/" + this.workfile.get('workspaceId') + "/workfile/" + this.workfile.get('id') + "/file/" + this.workfile.get('versionInfo').versionFileId + "?download=true")
            });

            it("displays a link to add a note", function() {
                var addLink = this.view.$(".actions a.dialog[data-dialog=NotesNew]");
                expect(addLink).toExist();
                expect(addLink).toHaveAttr("data-entity-type", "workfile")
                expect(addLink).toHaveAttr("data-entity-id", this.workfile.get("id"))
            });

            it("displays the activity list", function() {
                expect(this.view.$(".activity_list")).toExist();
            })
        })
    });

    describe("when the model is invalidated", function() {
        it("fetches the activity set", function() {
            this.view.model.trigger("invalidated")
            expect(this.server.requests[0].url).toBe(this.view.collection.url())
        });

        it("fetches the versions set", function() {
            this.view.model.trigger("invalidated");
            expect(this.server.lastFetch().url).toBe(this.view.allVersions.url())
        });
    });

    describe("when the activity list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.collection.trigger("changed")
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    });

    describe("when the version list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.allVersions.trigger("changed");
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    })
});
