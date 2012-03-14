describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({ query: "jackson5" })
    });

    describe("#url and #showUrl", function() {
        context("when only searching for items in a single workspace", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "5", searchIn: "this_workspace" });
            });

            expectPaginatedUrl("/edc/search/workspace/5?query=jackson5");
            expectShowUrl("#/workspaces/5/search/this_workspace/all/jackson5");
        });

        context("when prioritizing a particular workspace", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "5" });
            });

            context("when searching only the current user's workspaces", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "my_workspaces" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/edc/search/workspaces/?query=jackson5&entityType=workfile&workspaceId=5");
                    expectShowUrl("#/workspaces/5/search/my_workspaces/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/edc/search/workspaces/?query=jackson5&workspaceId=5&rows=50&page=1");
                    expectShowUrl("#/workspaces/5/search/my_workspaces/all/jackson5");
                });
            });

            context("when searching all of chorus", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "all" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/edc/search/global/?query=jackson5&entityType=workfile&workspaceId=5");
                    expectShowUrl("#/workspaces/5/search/all/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/edc/search/global/?query=jackson5&workspaceId=5");
                    expectShowUrl("#/workspaces/5/search/jackson5");
                });
            });
        });

        context("when not prioritizing a particular workspace", function() {
            beforeEach(function() {
                this.model.unset("workspaceId");
            });

            context("when searching only the current user's workspaces", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "my_workspaces" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/edc/search/workspaces/?query=jackson5&entityType=workfile");
                    expectShowUrl("#/search/my_workspaces/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/edc/search/workspaces/?query=jackson5");
                    expectShowUrl("#/search/my_workspaces/all/jackson5");
                });
            });

            context("when searching all of chorus", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "all" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/edc/search/global/?query=jackson5&entityType=workfile");
                    expectShowUrl("#/search/all/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/edc/search/global/?query=jackson5");
                    expectShowUrl("#/search/jackson5");
                });
            });
        });

        function expectUrl(url, paramsToIgnore) {
            it("has the right url", function() {
                if (!paramsToIgnore) paramsToIgnore = [ "rows", "page" ];
                expect(this.model.url()).toMatchUrl(url, { paramsToIgnore: paramsToIgnore });
            });
        }

        function expectPaginatedUrl(url) {
            it("respects page numbers", function() {
                this.model.set({ page: 3 });
                expect(this.model.url()).toMatchUrl(url + "&rows=50&page=3");
            });
        }

        function expectShowUrl(url) {
            it("has the right show url", function() {
                expect(this.model.showUrl()).toMatchUrl(url);
            });
        }
    });

    describe("#shortName", function() {
        it("returns a short name", function() {
            this.model.set({ query: "the longest query in the world" });
            expect(this.model.displayShortName()).toBe("the longest query in...")
        });
    });

    describe("#workspace", function() {
        context("when the model has a workspace id", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "123" });
            });

            it("returns a workspace model with the right id", function() {
                var workspace = this.model.workspace();
                expect(workspace).toBeA(chorus.models.Workspace);
                expect(workspace.get("id")).toBe("123");
            });

            it("memoizes", function() {
                expect(this.model.workspace()).toBe(this.model.workspace());
            });
        });

        context("when the model does NOT have a workspace id", function() {
            it("returns undefined", function() {
                expect(this.model.workspace()).toBeUndefined();
            });
        });
    });

    describe("#getResults", function() {
        beforeEach(function() {
            this.model = fixtures.searchResult({
                thisWorkspace: {
                    numFound: 3,
                    docs: [ fixtures.searchResultWorkfileJson() ]
                }
            });
        });

        context("when the search result is scoped to a single workspace", function() {
            it("returns the collection of items in that workspace", function() {
                this.model.set({ workspaceId: "101", searchIn: "this_workspace" });
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBe(this.model.workspaceItems());
            });
        });

        context("when the search results is filtered to a single entity type", function() {
            it("returns the results collection for that entity type", function() {
                this.model.set({ entityType: "workfile" });
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBe(this.model.workfiles());
            });
        });

        context("when the search result has no entity type and is not scoped to a single workspace", function() {
            it("returns undefined", function() {
                expect(this.model.getResults()).toBeUndefined();
            });
        });
    });

    describe("child collection methods", function() {
        beforeEach(function() {
            this.model = fixtures.searchResult({
                workspaceId: "123",
                thisWorkspace: {
                    numFound: 171,
                    docs: [
                        fixtures.searchResultWorkfileJson(),
                        fixtures.searchResultDatabaseObjectJson(),
                        fixtures.searchResultChorusViewJson(),
                        fixtures.searchResultWorkspaceJson()
                    ]
                }
            });
        });

        describe("#workspaceItems", function() {
            context("when there are workspace items", function() {
                beforeEach(function() {
                    this.workspaceItems = this.model.workspaceItems();
                });

                it("returns a Search WorkspaceItemSet", function() {
                    expect(this.workspaceItems).toBeA(chorus.collections.Search.WorkspaceItemSet);
                });

                it("instantiates the right type of model for each entry in the collection", function() {
                    expect(this.workspaceItems.at(0)).toBeA(chorus.models.Workfile);
                    expect(this.workspaceItems.at(1)).toBeA(chorus.models.DatabaseObject);
                    expect(this.workspaceItems.at(2)).toBeA(chorus.models.Dataset);
                    expect(this.workspaceItems.at(3)).toBeA(chorus.models.Workspace);
                });

                it("memoizes", function() {
                    expect(this.workspaceItems).toBe(this.model.workspaceItems());
                });
            });

            context("when there are no workfile results", function() {
                it("returns undefined", function() {
                    this.model.unset("thisWorkspace");
                    expect(this.model.workspaceItems()).toBeUndefined();
                })
            });
        });

        describe("#workfiles", function() {
            it("returns a Search WorkfileSet", function() {
                this.model = fixtures.searchResult();
                this.workfiles = this.model.workfiles();
                expect(this.workfiles).toBeA(chorus.collections.Search.WorkfileSet)
            });
        });

        describe("#tabularData", function() {
            it("returns a collection of tabular data", function() {
                this.model = fixtures.searchResult();
                expect(this.model.tabularData()).toBeA(chorus.collections.Search.TabularDataSet);
            });
        });

        describe("#users", function() {
            it("returns a Search UserSet", function() {
                expect(this.model.users()).toBeA(chorus.collections.UserSet)
            });
        });

        describe("#workspaces", function() {
            it("returns a Search WorkspaceSet", function() {
                expect(this.model.workspaces()).toBeA(chorus.collections.Search.WorkspaceSet)
            });

            context("when there are no workspace results", function() {
                it("returns undefined", function() {
                    this.model.unset("workspace");
                    expect(this.model.workspaces()).toBeUndefined();
                });
            });
        });

        describe("#hdfs", function() {
            it("returns a Search HdfsEntrySet", function() {
                expect(this.model.hdfs()).toBeA(chorus.collections.Search.HdfsEntrySet)
            });
        });

        describe("#instances", function() {
            it("returns a Search InstanceSet", function() {
                expect(this.model.instances()).toBeA(chorus.collections.Search.InstanceSet)
            });
        });
    });

    describe("#searchIn", function() {
        it("defaults to 'all'", function() {
            expect(this.model.searchIn()).toBe("all");
        });

        it("returns the 'searchIn' attribute, when one is set", function() {
            this.model.set({ searchIn: "my_workspaces" });
            expect(this.model.searchIn()).toBe("my_workspaces");
        });
    });

    describe("#entityType", function() {
        it("defaults to 'all'", function() {
            expect(this.model.entityType()).toBe('all');
        });

        context("when an entity type is set", function() {
            beforeEach(function() {
                this.model.set({entityType: "foo"});
            });

            it("gives back any set entity type", function() {
                expect(this.model.entityType()).toBe("foo");
            });

            it("is preserved through fetches", function() {
                this.model.fetch();
                this.server.completeFetchFor(this.model, fixtures.searchResult());
                expect(this.model.entityType()).toBe("foo");
            });
        });
    });

    describe("#currentPageNumber", function() {
        it("defaults to 1", function() {
            expect(this.model.currentPageNumber()).toBe(1);
        });

        context("when a page is set", function() {
            beforeEach(function() {
                this.model.set({page: 5});
            });

            it("gives back any set page", function() {
                expect(this.model.currentPageNumber()).toBe(5);
            });

            it("is preserved through fetches", function() {
                this.model.fetch();
                this.server.completeFetchFor(this.model, fixtures.searchResult());
                expect(this.model.currentPageNumber()).toBe(5);
            });
        });
    });

    describe("#totalPageNumber", function() {
        it("should return the correct number of total pages", function() {
            this.model.set({entityType: "user"});
            this.model.set(fixtures.searchResult());
            this.model.users().pagination.records = 1;
            expect(this.model.totalPageNumber()).toBe(1)

            this.model.users().pagination.records = 51;
            expect(this.model.totalPageNumber()).toBe(2);

            this.model.users().pagination.records = 101;
            expect(this.model.totalPageNumber()).toBe(3);
        });
    });

    describe("#getNextPage", function() {
        beforeEach(function() {
            this.model.set({user: { docs: [], numFound: 100 }, page: 1, entityType: "user"})
            this.model.users();
            this.model.getNextPage();
            var searchResult = fixtures.searchResult();
            this.users = searchResult.get("user").docs;
            this.server.completeFetchFor(this.model, searchResult);
        });

        it("sets page to 2", function() {
            expect(this.model.get("page")).toBe(2);
        });

        it("should replace the current results with the next page of results", function() {
            var users = this.model.users()
            expect(users).toBeA(chorus.collections.UserSet);
            expect(users.models.length).toBe(this.users.length)
        });
    });

    describe("#getPreviousPage", function() {
        beforeEach(function() {
            this.model.set({user: { docs: [], numFound: 100 }, page: 2, entityType: "user"})
            this.model.users();
            this.model.getPreviousPage();
            var searchResult = fixtures.searchResult();
            this.users = searchResult.get("user").docs;
            this.server.completeFetchFor(this.model, searchResult);
        });

        it("sets page to 1", function() {
            expect(this.model.get("page")).toBe(1);
        });

        it("should replace the current results with the previous page of results", function() {
            var users = this.model.users()
            expect(users).toBeA(chorus.collections.UserSet);
            expect(users.models.length).toBe(this.users.length)
        });
    });

    describe("#hasNextPage", function() {
        context("when we have a specific entity type", function() {
            beforeEach(function() {
                this.model.set(fixtures.searchResultJson());
                this.model.set({entityType: "user"});
            });
            it("should return true when there are 51 results", function() {
                this.model.get("user").numFound = 51;
                this.model.set({page: 1})
                expect(this.model.hasNextPage()).toBeTruthy();
            });

            it("should return true when there are 101 results", function() {
                this.model.get("user").numFound = 101;

                this.model.set({page: 2})
                expect(this.model.hasNextPage()).toBeTruthy();
            });

            it("should return false when there are less than 51 results", function() {
                this.model.get("user").numFound = 50;
                this.model.set({page: 1})
                expect(this.model.hasNextPage()).toBeFalsy();
            });
        });


        context("when entity type is all or undefined", function() {
            it("should return false", function() {
                expect(this.model.hasNextPage()).toBeFalsy();
            });

        })


        it("should return false when there are less than 101 results", function() {
            this.model.set({numFound: 51, page: 2});
            expect(this.model.hasNextPage()).toBeFalsy();
        });
    });

    describe("#hasPreviousPage", function() {
        context("when we have a specific entity type", function() {
            beforeEach(function() {
                this.model.set(fixtures.searchResultJson());
                this.model.set({entityType: "user"});
            });

            it("should return true when there are 51 results", function() {
                this.model.set({page: 4})
                expect(this.model.hasPreviousPage()).toBeTruthy();
            });

            it("should return false when already on page 1", function() {
                this.model.set({page: 1})
                expect(this.model.hasPreviousPage()).toBeFalsy();
            });
        });

        context("when entity type is all or undefined", function() {
            it("should return false", function() {
                expect(this.model.hasPreviousPage()).toBeFalsy();
            });
        })
    });

    describe("#resetResults", function() {
        beforeEach(function() {
            this.model.set(fixtures.searchResultJson());
            this.orig_users = _.clone(this.model.users());
            this.orig_tabularData = _.clone(this.model.tabularData());
            this.orig_workfiles = _.clone(this.model.workfiles());
            this.orig_workspaces = _.clone(this.model.workspaces());
            this.model.get("user").docs[0] = {id: 3};
        });

        context("when we have a specific entityType", function() {
            beforeEach(function() {
                this.model.set({entityType: "user"});
            });

            it("should only reset the results for the current entityType", function() {
                this.model.resetResults();

                expect(this.model.users()).not.toEqual(this.orig_users);
                expect(this.model.tabularData()).toEqual(this.orig_tabularData);
                expect(this.model.workfiles()).toEqual(this.orig_workfiles);
                expect(this.model.workspaces()).toEqual(this.orig_workspaces);
            })
        });

        context("when we do not have a specific entityType", function() {
            it("should do nothing", function() {
                this.model.resetResults();

                expect(this.model.users()).toEqual(this.orig_users);
                expect(this.model.tabularData()).toEqual(this.orig_tabularData);
                expect(this.model.workfiles()).toEqual(this.orig_workfiles);
                expect(this.model.workspaces()).toEqual(this.orig_workspaces);
            })
        });
    });

    describe("triggering invalidated", function() {
        beforeEach(function() {
            var search = fixtures.searchResult()
            this.model = search;
            this.model.selectedItem = search.users().at(0);
            spyOnEvent(this.model.selectedItem, 'invalidated');
            this.model.trigger("invalidated");
        });

        it("should trigger invalidated on the currently selected item", function() {
            expect("invalidated").toHaveBeenTriggeredOn(this.model.selectedItem);
        });

    });
});
