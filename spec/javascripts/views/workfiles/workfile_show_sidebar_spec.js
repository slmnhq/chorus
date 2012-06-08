describe("chorus.views.WorkfileShowSidebar", function() {
    beforeEach(function() {
        spyOn(chorus.views.Sidebar.prototype, "jumpToTop");
        chorus.page = { workspace: newFixtures.workspace() };
        this.workfile = rspecFixtures.workfile.text();
        spyOn(chorus.views.WorkfileShowSidebar.prototype, "recalculateScrolling").andCallThrough();
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("setup", function() {
        it("fetches the ActivitySet for the workfile", function() {
            expect(this.workfile.activities()).toHaveBeenFetched();
        });

        context("when the dataset:back event is broadcast", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("dataset:back");
            });

            it("calls recalculate scrolling", function() {
                expect(this.view.recalculateScrolling).toHaveBeenCalled();
            });
        });
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
            this.workfile = rspecFixtures.workfile.sql();
            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });

            this.view.model.fetch();
            this.view.model.workspace().fetch();

            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.workspace(), newFixtures.workspace({
                id: this.workfile.workspace().id,
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

            this.view.render();
        });

        it("displays a link to copy the workfile to another workspace", function() {
            var copyLink = this.view.$(".actions a[data-dialog=CopyWorkfile]");
            expect(copyLink).toExist();
            expect(copyLink).toHaveAttr("data-workspace-id", this.view.model.workspace().id)
            expect(copyLink).toHaveAttr("data-workfile-id", this.view.model.get("id"))
            expect(copyLink).toHaveAttr("data-active-only", 'true')
        })

        it("has an activities tab", function() {
            expect(this.view.$('.tab_control .activity_list')).toExist();
            expect(this.view.tabs.activity).toBeA(chorus.views.ActivityList);
        });

        it("has a functions tab", function() {
            expect(this.view.$('.tab_control .database_function_sidebar_list')).toExist();
            expect(this.view.tabs.database_function_list).toBeA(chorus.views.DatabaseFunctionSidebarList);
        });

        it("has a dataset tab", function() {
            expect(this.view.$('.tab_control .dataset_and_column_list')).toExist();
            expect(this.view.tabs.datasets_and_columns).toBeA(chorus.views.DatasetAndColumnList);
        });

        it("renders selected version", function() {
            expect(this.view.$(".chosen").text()).toMatchTranslation("workfile.version_title", {versionNum: this.view.model.get("versionInfo").versionNum})
        })

        context("when a dataset is selected", function() {
            beforeEach(function() {
                var sandboxTable = newFixtures.dataset.sandboxTable();
                chorus.PageEvents.broadcast("datasetSelected", sandboxTable);
            });
            it("should scroll to the top", function() {
                expect(this.view.jumpToTop).toHaveBeenCalled();
            });
        })
    });

    context("with a non-sql workfile", function() {
        beforeEach(function() {
            this.workfile = rspecFixtures.workfile.text({ versionInfo: { updatedAt: "2011-11-22T10:46:03Z" }});
            expect(this.workfile.isText()).toBeTruthy();

            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });

            this.view.model.fetch();
            this.view.model.workspace().fetch();

            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.workspace(), newFixtures.workspace({
                id: this.workfile.workspace().id,
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
            expect(copyLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id)
            expect(copyLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
        })

        it("displays the filename", function() {
            expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
        });

        it("displays the workfile's date", function() {
            expect(this.view.$(".updated_on").text().trim()).toBe("November 22");
        });

        it("displays the name of the person who updated the workfile", function() {
            expect(this.view.$(".updated_by").text().trim()).toBe(this.workfile.modifier().displayShortName());
        });

        it("links to the profile page of the modifier", function() {
            expect(this.view.$("a.updated_by").attr("href")).toBe(this.workfile.modifier().showUrl());
        })

        it("displays a link to delete the workfile", function() {
            var deleteLink = this.view.$(".actions a[data-alert=WorkfileDelete]");
            expect(deleteLink).toExist();
            expect(deleteLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id)
            expect(deleteLink).toHaveAttr("data-workfile-id", this.workfile.get("id"))
        });

        it("displays a link to add a note", function() {
            var addLink = this.view.$(".actions a.dialog[data-dialog=NotesNew]");
            expect(addLink).toExist();
            expect(addLink).toHaveAttr("data-entity-type", "workfile");
            expect(addLink).toHaveAttr("data-entity-id", this.workfile.get("id"));
            expect(addLink).toHaveAttr("data-workspace-id", this.workfile.workspace().id);
            expect(addLink).toHaveAttr("data-allow-workspace-attachments", "true");
        });

        it("displays the activity list", function() {
            expect(this.view.$(".activity_list")).toExist();
        });
    });

    context("with an archived workspace", function() {
        beforeEach(function() {
            this.model = rspecFixtures.workfile.sql();
            this.view = new chorus.views.WorkfileShowSidebar({ model : this.model });

            this.model.fetch();
            this.model.workspace().fetch();

            this.server.completeFetchFor(this.model);
            this.server.completeFetchFor(this.model.workspace(), newFixtures.workspace({ archivedAt: "2012-05-08T21:40:14Z" }));

            this.view.render();
        });

        it("should not show the delete and add note links", function() {
            expect(this.view.$(".actions a[data-alert=WorkfileDelete]")).not.toExist();
            expect(this.view.$(".actions a[data-dialog=NotesNew]")).not.toExist();
        });

        it("should not show the functions or data tab", function() {
            expect(this.view.$(".tab_control .database_dataset_list")).not.toExist();
            expect(this.view.$(".tab_control .database_function_list")).not.toExist();
        });
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
