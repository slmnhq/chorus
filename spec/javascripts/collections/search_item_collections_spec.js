describe("chorus.collections.Search", function() {
    beforeEach(function() {
        this.search = fixtures.searchResult({
            instance: {
                numFound: 131,
                docs: [
                    fixtures.instanceJson({ id: '101' }),
                    fixtures.instanceJson({ id: '102' }),
                    fixtures.instanceJson({ id: '103' }),
                    fixtures.instanceJson({ id: '104' }),
                    fixtures.instanceJson({ id: '105' }),
                ]
            }
        });

        this.collection = new chorus.collections.Search.InstanceSet([], {search: this.search})
    });

    describe("#refreshFromSearch", function() {
        beforeEach(function() {
            this.collection.refreshFromSearch();
        });

        it("populates the collection with the right data from the search", function() {
            expect(this.collection.length).toBe(5);
            expect(this.collection.at(0).id).toBe('101');
            expect(this.collection.at(1).id).toBe('102');
            expect(this.collection.at(2).id).toBe('103');
            expect(this.collection.at(3).id).toBe('104');
            expect(this.collection.at(4).id).toBe('105');
        });

        it("sets the collection's pagination information correctly", function() {
            expect(this.collection.pagination.records).toBe(131);
            expect(this.collection.pagination.total).toBe(3);
            expect(this.collection.pagination.page).toBe(1);
        });
    });

    describe("#fetchPage", function() {
        beforeEach(function() {
            this.collection.fetchPage(5);
        });

        it("fetches the correct page of search results", function() {
            expect(this.server.lastFetch().url).toBe(this.search.url({ page: 5 }));
        });

        it("refreshes the collection on success", function() {
            this.server.completeFetchFor(this.search, new chorus.models.SearchResult({
                instance: {
                    numFound: 51,
                    docs: [
                        fixtures.instanceJson({ id: '121' }),
                        fixtures.instanceJson({ id: '122' }),
                        fixtures.instanceJson({ id: '123' })
                    ]
                }}));

            expect(this.collection.pagination.records).toBe(51);
            expect(this.collection.length).toBe(3);
            expect(this.collection.at(0).get("id")).toBe("121");
            expect(this.collection.at(1).get("id")).toBe("122");
            expect(this.collection.at(2).get("id")).toBe("123");
        });
    });

    describe("WorkfileSet#refreshFromSearch", function() {
        beforeEach(function() {
            this.search = fixtures.searchResult({
                workfile: {
                    numFound: 171,
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

            this.workfiles = new chorus.collections.Search.WorkfileSet([], {search: this.search});
            this.workfiles.refreshFromSearch();
        });

        it("sets the filenames correctly, with em tags stripped out", function() {
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
    });
});
