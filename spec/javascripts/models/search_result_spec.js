describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({ query: "jackson5" })
    });

    it("defaults entityType and searchIn to 'all'", function() {
        expect(this.model.get("entityType")).toBe('all')
        expect(this.model.get("searchIn")).toBe('all')
    })

    describe("#url and #showUrl", function() {
        context("when scoped to the current user's workspaces", function() {
            beforeEach(function() {
                this.model.set({ searchIn: "my_workspaces" });
            });

            it("uses the workspaces search api", function() {
                expect(this.model.url()).toMatchUrl("/edc/search/workspaces/?query=jackson5", {
                    paramsToIgnore: [ "rows", "page" ]
                });
            });

            it("has the show url for the workspace-scope", function() {
                expect(this.model.showUrl()).toMatchUrl("#/search/my_workspaces/all/jackson5");
            });
        });

        context("when there is a specific 'entityType' (not 'all')", function() {
            beforeEach(function() {
                this.model.set({ entityType: "users" });
            });

            it("uses the entityType-specific search api", function() {
                expect(this.model.url()).toMatchUrl("/edc/search/global/?query=jackson5&entityType=users", {
                    paramsToIgnore: [ "rows", "page" ]
                });
            });

            it("has the show url for searching for only that entity type", function() {
                expect(this.model.showUrl()).toMatchUrl("#/search/all/users/jackson5");
            });
        });

        context("when the entityType parameter is set to 'all' and not scoped to the current user's workspaces", function() {
            beforeEach(function() {
                this.model.set({ entityType: "all" });
            });

            it("doesn't include the entityType in the API url", function() {
                expect(this.model.url()).toMatchUrl("/edc/search/global/?query=jackson5", {
                    paramsToIgnore: [ "rows", "page" ]
                });
            });

            it("has the global search show url", function() {
                expect(this.model.showUrl()).toMatchUrl("#/search/jackson5");
            });
        });
    });

    describe("#shortName", function() {
        it("returns a short name", function() {
            this.model.set({ query: "the longest query in the world" });
            expect(this.model.displayShortName()).toBe("the longest query in...")
        });
    });

    describe("#workfiles", function() {
        context("when there are workfile results", function() {
            beforeEach(function() {
                this.model = fixtures.searchResult({
                    workfile: {
                        numFound: 3,
                        docs: [
                            {
                                id: '1',
                                name: 'My <em>Cool</em> Workfile',
                                comments: [
                                    {"lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isInsight": false, "content": "nice <em>cool<\/em> file", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                                    {"lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isInsight": false, "content": "nice <em>cool<\/em> comment", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                                    {"lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isInsight": true, "content": "Nice <em>cool<\/em> insight", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}}
                                ]
                            },
                            {
                                id: '2',
                                name: 'Workfiles are <em>Cool</em>',
                                comments: []
                            },
                            {
                                id: '3',
                                name: '<em>Cool</em> Breeze',
                                comments: []
                            }
                        ]
                    }
                });

                this.workfiles = this.model.workfiles();
            });

            it("returns a WorkfileSet", function() {
                expect(this.workfiles).toBeA(chorus.collections.WorkfileSet)
            });

            it("has the right filenames, with em tags stripped out", function() {
                expect(this.workfiles.models.length).toBe(3);

                expect(this.workfiles.models[0].get('id')).toBe('1');
                expect(this.workfiles.models[0].get('name')).toBe('My <em>Cool</em> Workfile');
                expect(this.workfiles.models[0].get('fileName')).toBe('My Cool Workfile');

                expect(this.workfiles.models[1].get('id')).toBe('2');
                expect(this.workfiles.models[1].get('name')).toBe('Workfiles are <em>Cool</em>');
                expect(this.workfiles.models[1].get('fileName')).toBe('Workfiles are Cool');

                expect(this.workfiles.models[2].get('id')).toBe('3');
                expect(this.workfiles.models[2].get('name')).toBe('<em>Cool</em> Breeze');
                expect(this.workfiles.models[2].get('fileName')).toBe('Cool Breeze');
            });

            it("has the comments/notes/insights for the workfile", function() {
                expect(this.workfiles.models[0].comments.length).toBe(3);
                expect(this.workfiles.models[1].comments.length).toBe(0);
                expect(this.workfiles.models[2].comments.length).toBe(0);

                _.each(this.workfiles.models[0].comments, function(comment) {
                    expect(comment.name).toContainText("Cool");
                });

                expect(this.workfiles.models[0].comments.at(0).get("isInsight")).toBeFalsy();
                expect(this.workfiles.models[0].comments.at(1).get("isInsight")).toBeFalsy();
                expect(this.workfiles.models[0].comments.at(2).get("isInsight")).toBeTruthy();
            });

            it("has numFound in 'total'", function() {
                expect(this.workfiles.attributes.total).toBe(this.model.get('workfile').numFound);
            });

            it("memoizes", function() {
                expect(this.workfiles).toBe(this.model.workfiles());
            });
        });

        context("when there are no workfile results", function() {
            it("returns undefined", function() {
                this.model.unset("workfile");
                expect(this.model.workfiles()).toBeUndefined();
            })
        });
    });

    // TODO: #workspaces

    describe("#tabularData", function() {
        context("when there are dataset results", function() {
            beforeEach(function() {
                this.model = fixtures.searchResult();
                this.tabularData = this.model.tabularData();
            });

            it("returns a collection of tabular data", function() {
                expect(this.tabularData.length).toBe(10);
                expect(this.tabularData).toBeA(chorus.collections.TabularDataSet);
            });

            it("has numFound in 'total'", function() {
                expect(this.tabularData.attributes.total).toBe(this.model.get('dataset').numFound);
            });

            it("memoizes", function() {
                expect(this.tabularData).toBe(this.model.tabularData());
            });
        });

        context("when there are no dataset results", function() {
            it("returns undefined", function() {
                this.model.unset("dataset");
                expect(this.model.tabularData()).toBeUndefined();
            });
        });
    });

    describe("#users", function() {
        context("when there are results", function() {
            beforeEach(function() {
                this.model.set(fixtures.searchResultJson());
                this.users = this.model.users();
            });

            it("returns a UserSet", function() {
                expect(this.users).toBeA(chorus.collections.UserSet)
            });

            it("has the correct number of users", function() {
                expect(this.users.models.length).toBe(4);
            });

            it("has numFound in 'total'", function() {
                expect(this.users.attributes.total).toBe(this.model.get('user').numFound);
            });

            it("memoizes", function() {
                expect(this.users).toBe(this.model.users());
            });
        })

        context("when there are no results", function() {
            beforeEach(function() {
                this.model.set(fixtures.searchResultJson());
                this.model.unset("user")
            });

            it("returns undefined", function() {
                expect(this.model.users()).toBeUndefined();
            })
        });
    });

    describe("#workspaces", function() {
        context("when there are workspace results", function() {
            beforeEach(function() {
                this.model.set(fixtures.searchResultJson());
                this.workspaces = this.model.workspaces();
            });

            it("memoizes", function() {
                expect(this.workspaces).toBe(this.model.workspaces());
            });
        });

        context("when there are no workspace results", function() {
            it("returns undefined", function() {
                this.model.unset("workspace");
                expect(this.model.workspaces()).toBeUndefined();
            });
        });
    });
})
