describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({ query: "jackson5" })
    });

    describe("#url and #showUrl", function() {
        context("when only searching for items in a single workspace", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "5", searchIn: "this_workspace" });
            });

            expectPaginatedUrl("/edc/search/workspace/?workspaceId=5&query=jackson5");
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

        context("when the search result is filtered by workspace AND by entity type", function() {
            it("returns the collection for its entity type", function() {
                this.model.set({ entityType: "workfile", searchIn: "this_workspace", workspaceId: "101" });
                this.model.unset("thisWorkspace");
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

                it("sets the collection's 'loaded' flag", function() {
                    expect(this.workspaceItems.loaded).toBeTruthy();
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

        describe("#attachments", function() {
            it("returns a Search ArtifactSet", function() {
                expect(this.model.attachments()).toBeA(chorus.collections.Search.ArtifactSet)
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

    describe("#total", function() {
        context("when there are results", function() {
            beforeEach(function() {
                this.model = fixtures.emptySearchResult();
                this.model.set({
                    thisWorkspace: {
                        numFound: 3
                    },
                    attachment: {
                        numFound: 4
                    }
                });
            });

            it("returns the sum of numFound", function() {
                expect(this.model.total()).toBe(7)
            });
        });

        context("when there are no results", function() {
            beforeEach(function() {
                this.model = fixtures.emptySearchResult();
            })

            it("returns 0", function() {
                expect(this.model.total()).toBe(0)
            });
        });
    })

    describe("#isConstrained", function() {
        beforeEach(function() {
            this.model = fixtures.searchResult();
        });

        context("when isScoped returns true", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(true);
                spyOn(this.model, "hasSpecificEntityType").andReturn(false);
            })

            it("return true", function() {
                expect(this.model.isConstrained()).toBeTruthy();
            });
        });

        context("when hasSpecificEntityType returns true", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(false);
                spyOn(this.model, "hasSpecificEntityType").andReturn(true);
            })

            it("return true", function() {
                expect(this.model.isConstrained()).toBeTruthy();
            });
        });

        context("when isScoped and hasSpecificEntityType return false", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(false);
                spyOn(this.model, "hasSpecificEntityType").andReturn(false);
            })

            it("return false", function() {
                expect(this.model.isConstrained()).toBeFalsy();
            });
        });
    })

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
