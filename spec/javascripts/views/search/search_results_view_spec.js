describe("chorus.views.SearchResults", function() {
    var makeSearchResults = function() {
        return fixtures.searchResult({
            entityType: "all",
            workspaceId: '10001',
            thisWorkspace: {
                docs: [
                    fixtures.searchResultWorkfileJson(),
                    fixtures.searchResultDatabaseObjectJson(),
                    fixtures.searchResultChorusViewJson()
                ],
                numFound: 3
            }
        });
    }

    context("when there are no search results", function() {
        beforeEach(function() {
            this.model = fixtures.emptySearchResult({ query: "foo" });
            this.view = new chorus.views.SearchResults({model: this.model});
            this.view.render();
        });

        it("displays the blank slate text", function() {
            expect(this.view.$(".sorry .header").text()).toContain(t("search.no_results.header"))
            expect(this.view.$(".sorry ul li").text()).toContain(t("search.no_results.check_spelling"))
            expect(this.view.$(".sorry ul li").text()).toContain(t("search.no_results.try_wildcards"))
        });

        context("and there are no filters applied", function() {
            beforeEach(function() {
                spyOn(this.model, "isConstrained").andReturn(false);
                this.view = new chorus.views.SearchResults({model: this.model});
                this.view.render();
            });

            it("does not suggest expanding the search", function() {
                expect(this.view.$(".sorry ul li").text()).not.toContain(t("search.no_results.expand"))
            });
        });

        context("and there are filters applied", function() {
            beforeEach(function() {
                spyOn(this.model, "isConstrained").andReturn(true);
                this.view = new chorus.views.SearchResults({model: this.model});
                this.view.render();
            });

            it("suggests expanding the search", function() {
                expect(this.view.$(".sorry ul li").text()).toContain(t("search.no_results.expand"))
                expect(this.view.$(".sorry ul li a")).toHaveHref("#/search/foo")
            });
        });
    });

    context("when there are search results", function() {
        beforeEach(function() {
            this.model = makeSearchResults()
            this.view = new chorus.views.SearchResults({model: this.model});
            this.view.render();
        });

        context("when searching for all types of items", function() {
            it("includes a section for every type of item", function() {
                var sections = this.view.$(".search_result_list");
                expect(sections.filter(".this_workspace.selectable")).toExist();
                expect(sections.filter(".user_list.selectable")).toExist();
                expect(sections.filter(".workfile_list.selectable")).toExist();
                expect(sections.filter(".attachment_list.selectable")).toExist();
                expect(sections.filter(".workspace_list.selectable")).toExist();
                expect(sections.filter(".hdfs_list.selectable")).toExist();
                expect(sections.filter(".instance_list.selectable")).toExist();
            });
        });

        context("when searching for only workfiles", function() {
            beforeEach(function() {
                this.model = makeSearchResults()
                this.model.set({ entityType: "workfile" });
                this.model.unset("workspace");
                this.model.unset("attachment");
                this.model.unset("user");
                this.model.unset("hdfs");
                this.model.unset("dataset");
                this.model.unset("instance");
                this.view = new chorus.views.SearchResults({ model: this.model });
                this.view.render();
            });

            itShowsOnlyTheWorkfileSection();
        });

        context("when searching for only workfiles in a particular workspace", function() {
            beforeEach(function() {
                this.model = fixtures.searchResult({
                    entityType: "workfile",
                    workspaceId: "101",
                    searchIn: "this_workspace",

                    attachment: null,
                    workspace: null,
                    instance: null,
                    dataset: null,
                    hdfs: null,
                    user: null
                });
                this.view = new chorus.views.SearchResults({ model: this.model });
                this.view.render();
            });

            itShowsOnlyTheWorkfileSection();
        });

        function itShowsOnlyTheWorkfileSection() {
            it("shows the workfile section", function() {
                expect(this.view.$(".search_result_list.workfile_list")).toExist();
            });

            it("does not show the sections for other types of items", function() {
                expect(this.view.$(".search_result_list.this_workspace")).not.toExist();
                expect(this.view.$(".search_result_list.attachment_list")).not.toExist();
                expect(this.view.$(".search_result_list.instance_list")).not.toExist();
                expect(this.view.$(".search_result_list.workspace_list")).not.toExist();
                expect(this.view.$(".search_result_list.user_list")).not.toExist();
                expect(this.view.$(".search_result_list.dataset_list")).not.toExist();
                expect(this.view.$(".search_result_list.hdfs_list")).not.toExist();
            });
        }

        describe("clicking an li", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, 'broadcast');
            });

            context("when the li is in the 'this workspace' section", function() {
                context("and it is for a workfile", function() {
                    it("triggers the 'workfile:selected' event on itself, with the clicked model", function() {
                        var modelToClick = this.model.workspaceItems().at(0);
                        this.view.$(".this_workspace li").eq(0).click();
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:selected", modelToClick);
                    });
                });

                context("and it is for a dataset", function() {
                    it("triggers the 'tabularData:selected' event on itself, with the clicked model", function() {
                        var modelToClick = this.model.workspaceItems().at(1);
                        this.view.$(".this_workspace li").eq(1).click();
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("tabularData:selected", modelToClick);
                    });
                });
            });

            context("when the li is for a workfile", function() {
                it("triggers the 'workfile:selected' event on itself, with the clicked workfile", function() {
                    var workfileToClick = this.model.workfiles().at(1);
                    this.view.$(".workfile_list li").eq(1).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:selected", workfileToClick);
                });
            });

            context("when the li is for an attachment", function() {
                it("triggers the 'attachment:selected' event on itself, with the clicked attachment", function() {
                    var attachmentToClick = this.model.attachments().at(1);
                    this.view.$(".attachment_list li").eq(1).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("attachment:selected", attachmentToClick);
                });
            });

            context("when the li is for a workspace", function() {
                it("broadcasts the 'workspace:selected' page event, with the clicked workspace", function() {
                    var workspaceToClick = this.model.workspaces().at(1);
                    this.view.$(".workspace_list li").eq(1).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workspace:selected", workspaceToClick);
                });
            });

            context("when the li is for a tabular data", function() {
                it("broadcasts the 'tabularData:selected' page event, with the clicked tabular data", function() {
                    var modelToClick = this.model.tabularData().at(0);
                    this.view.$(".dataset_list li").eq(0).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("tabularData:selected", modelToClick);
                });
            });

            context("when the li is for a hadoop file", function() {
                it("broadcasts the 'hdfs_entry:selected' page event with the clicked hdfs file", function() {
                    var modelToClick = this.model.hdfs().at(0);
                    this.view.$(".hdfs_list li").eq(0).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("hdfs_entry:selected", modelToClick);
                });
            });

            context("when the li is for an instance", function() {
                it("broadcasts the 'instance:selected' page event with the clicked instance", function() {
                    var modelToClick = this.model.instances().at(0);
                    this.view.$(".instance_list li").eq(0).click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("instance:selected", modelToClick);
                });
            });
        });
    });
});
