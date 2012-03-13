describe("chorus.pages.SearchIndexPage", function() {
    beforeEach(function() {
        this.query = "foo";
    });

    describe("when searching for all items, across all of chorus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage(this.query);
        });

        it("fetches the search results for the given query", function() {
            expect(this.page.search.entityType()).toBe("all");
            expect(this.page.search.searchIn()).toBe("all");
            expect(this.page.search).toHaveBeenFetched();
        });

        describe("when the search result fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, fixtures.searchResult());
            });

            it("has breadcrumbs", function() {
                expect(this.page.$(".breadcrumbs li:eq(0)")).toContainTranslation('breadcrumbs.home');
                expect((this.page.$(".breadcrumbs li:eq(0) a")).attr("href")).toBe("#/");

                expect(this.page.$(".breadcrumbs li:eq(1) .slug")).toContainTranslation('breadcrumbs.search_results');
            });

            it("has the right title", function() {
                expect(this.page.$(".default_content_header h1")).toContainTranslation("search.index.title", {query: this.query});
            });

            it("has a 'Show All Results' link", function() {
                expect(this.page.$('.default_content_header .type .title')).toContainTranslation("search.show")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.all")
            });

            it("has filtered result links", function() {
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.workfile")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.hdfs")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.dataset")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.workspace")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.user")
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.instance")
            });

            describe("filtering by result type", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.page.$('.default_content_header li[data-type="workspace"] a').click();
                });

                it("should navigate to the filtered result type page", function() {
                    expect(this.page.search.entityType()).toBe("workspace");
                    expect(this.page.search.searchIn()).toBe("all");
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.page.search.showUrl(), true);
                });
            });

            it("has a 'Search in' filter link", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.all");
                expect(this.page.$('.default_content_header .search_in .title')).toContainTranslation("search.search_in")
                expect(this.page.$('.default_content_header .search_in a')).toContainTranslation("search.in.all")
                expect(this.page.$('.default_content_header .search_in a')).toContainTranslation("search.in.my_workspaces")
            });

            it("navigates to the right page when 'my workspaces' is selected from the 'search in' menu", function() {
                spyOn(chorus.router, "navigate");
                chorus.PageEvents.broadcast("choice:search_in", "my_workspaces");
                expect(this.page.search.entityType()).toBe("all");
                expect(this.page.search.searchIn()).toBe("my_workspaces");
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.page.search.showUrl(), true);
            });

            describe("the workfile section", function() {
                beforeEach(function() {
                    this.workfileLIs = this.page.$(".workfile_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.workfileLIs.length).toBeGreaterThan(0);
                });

                it("selects the first workfile by default", function() {
                    expect(this.workfileLIs.eq(0)).toHaveClass("selected");
                });

                describe("clicking on a workfile search result", function() {
                    beforeEach(function() {
                        this.workfileLIs.eq(1).trigger("click");
                    });

                    it("selects that workfile", function() {
                        expect(this.workfileLIs.eq(1)).toHaveClass("selected");
                    });

                    it("shows that workfile in the sidebar", function() {
                        expect(this.page.sidebar.$(".fileName")).toHaveText("test.sql");
                    });

                    it("does not show the 'add a note' link in the sidebar", function() {
                        expect(this.page.sidebar.$("a[data-dialog='NotesNew']")).not.toExist()
                    })
                });
            });

            describe("the workspace section", function() {
                beforeEach(function() {
                    this.workspaceLIs = this.page.$(".workspace_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.workspaceLIs.length).toBeGreaterThan(0);
                });

                describe("clicking on a workspace search result", function() {
                    beforeEach(function() {
                        this.workspaceLIs.eq(1).trigger("click");
                    });

                    it("selects that workspace", function() {
                        expect(this.workspaceLIs.eq(1)).toHaveClass("selected");
                    });

                    it("shows that workspace in the sidebar", function() {
                        expect(this.page.sidebar.$(".info .name")).toHaveText("other_ws");
                    });

                    it("show the 'add a note' link in the sidebar", function() {
                        expect(this.page.sidebar.$("a[data-dialog='NotesNew']")).toExist()
                    })

                    it("show the 'add an insight' link in the sidebar", function() {
                        expect(this.page.sidebar.$("a[data-dialog='InsightsNew']")).toExist()
                    })
                });
            });

            describe("the dataset section", function() {
                beforeEach(function() {
                    this.datasetLIs = this.page.$(".dataset_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.datasetLIs.length).toBeGreaterThan(0);
                });

                describe("clicking on a tabular data search result", function() {
                    beforeEach(function() {
                        this.datasetLIs.eq(2).trigger("click");
                    });

                    it("selects that tabular data item", function() {
                        expect(this.datasetLIs.eq(2)).toHaveClass("selected");
                    });

                    it("shows the tabular data item in the sidebar", function() {
                        expect(this.page.sidebar.$(".info .name")).toHaveText("test1");
                    });

                    it("shows the associate-with-workspace link in the sidebar", function() {
                        expect(this.page.sidebar.$('a.associate')).toExist();
                    });
                });
            });

            describe("the instance section", function() {
                beforeEach(function() {
                    this.instanceLIs = this.page.$(".instance_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.instanceLIs.length).toBe(2)
                });

                describe("clicking on an instance search result", function() {
                    beforeEach(function() {
                        spyOn(this.page.sidebars.instance, "setInstance");
                        this.instanceLIs.eq(1).trigger("click");
                    });

                    it("selects that instance", function() {
                        expect(this.instanceLIs.eq(1)).toHaveClass("selected");
                    });

                    it("shows the instance in the sidebar", function() {
                        expect($(this.page.sidebar.el)).toHaveClass("instance_list_sidebar")
                        expect(this.page.sidebars.instance.setInstance).toHaveBeenCalledWith(this.page.search.instances().at(1))
                    });
                });
            });

            describe("the user section", function() {
                beforeEach(function() {
                    this.users = this.page.search.users();
                    this.userLis = this.page.$(".user_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.userLis.length).toBeGreaterThan(0);
                });

                describe("clicking on a user search result", function() {
                    beforeEach(function() {
                        this.clickedUser = this.users.at(1);
                        this.userLis.eq(1).trigger("click");
                    });

                    it("selects that user", function() {
                        expect(this.userLis.eq(1)).toHaveClass("selected");
                    });

                    it("fetches the user's activities'", function() {
                        expect(this.clickedUser.activities()).toHaveBeenFetched();
                    });

                    describe("when all of the sidebar's fetches complete", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.clickedUser.activities(), []);
                            this.server.completeFetchFor(chorus.models.Config.instance());
                        });

                        it("shows that user in the sidebar", function() {
                            expect(this.page.sidebar.$(".info .full_name")).toHaveText(this.users.at(1).displayName());
                        });
                    });
                });
            });

            describe("the hdfs section", function() {
                beforeEach(function() {
                    this.files = this.page.search.hdfs();
                    this.fileLis = this.page.$(".hdfs_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.fileLis.length).toBe(1);
                });

                describe("clicking on a file search result", function() {
                    beforeEach(function() {
                        this.clickedFile = this.files.at(0);
                        this.fileLis.eq(0).trigger("click");
                    });

                    it("selects that file", function() {
                        expect(this.fileLis.eq(0)).toHaveClass("selected");
                    });

                    it("fetches the file's activities'", function() {
                        expect(this.clickedFile.activities()).toHaveBeenFetched();
                    });

                    describe("when all of the sidebar's fetches complete", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.clickedFile.activities(), []);
                        });

                        it("shows that file in the sidebar", function() {
                            expect(this.page.sidebar.$(".info .full_name")).toHaveText("");
                        });
                    });
                });
            });
        });
    });

    describe("when searching for only workspaces, across all of chorus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("all", "workspace", this.query);
        });

        it("fetches from the right search url", function() {
            expect(this.page.search.entityType()).toBe("workspace");
            expect(this.page.search.searchIn()).toBe("all");
            expect(this.page.search).toHaveBeenFetched();
        });


        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, fixtures.searchResult(this.page.search.attributes));
            });

            it("selects the 'all of chorus' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.all");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.workspace");
            });
        });
    });

    describe("when searching for all items in the current user's workspaces", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("my_workspaces", "all", this.query);
            this.search = this.page.search;
        });

        it("fetches the right search result", function() {
            expect(this.search.searchIn()).toBe("my_workspaces");
            expect(this.search.entityType()).toBe('all');
            expect(this.search).toHaveBeenFetched();
        });

        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, fixtures.searchResult(this.page.search.attributes));
            });

            it("selects the 'my workspaces' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.my_workspaces");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.all");
            });
        });
    });

    describe("when searching only for workfiles in the current user's workspaces", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("my_workspaces", "workfile", this.query);
            this.search = this.page.search;
        });

        it("fetches the right search result", function() {
            expect(this.search.searchIn()).toBe("my_workspaces");
            expect(this.search.entityType()).toBe("workfile");
            expect(this.search).toHaveBeenFetched();
        });

        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, fixtures.searchResult(this.page.search.attributes));
            });

            it("selects the 'my workspaces' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.my_workspaces");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.workfile");
            });
        });
    });
});
