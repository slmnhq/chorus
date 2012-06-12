describe("chorus.models.DatabaseObject", function() {
    var objectWithEncodingIssues = {
        schema : {
            name: "b/a/r",
            id: 3,
            database: {
                name: "%foo%",
                id: 2,
                instance: {
                    id: 1
                }
            }
        },
        objectName: "a space"
    };

    beforeEach(function() {
        this.databaseObject = rspecFixtures.databaseObject({
            schema: {
                id: 1,
                name: "ipa",
                database: {
                    "name": "beers",
                    instance: {
                        id: 12
                    }
                }
            },
            objectType: "TABLE"
        });
    });

    describe("url", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = rspecFixtures.databaseObject(objectWithEncodingIssues);
            });

            it("uses the table exploration api", function() {
                expect(this.databaseObject.url()).toContain("/database_objects/" + + this.databaseObject.id)
            });
        });

        context("when it is a view", function() {
            beforeEach(function() {
                var viewWithEncodingIssues = objectWithEncodingIssues;
                viewWithEncodingIssues.objectType = "VIEW";
                this.databaseObject = rspecFixtures.databaseObject(viewWithEncodingIssues);
            });

            it("uses the table exploration api", function() {
                expect(this.databaseObject.url()).toContain("/database_objects/" + this.databaseObject.id)
            });
        });
    });

    describe("showUrl", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = rspecFixtures.databaseObject(objectWithEncodingIssues);
            });

            it("has the correct url", function() {
                expect(this.databaseObject.showUrl()).toContain("/database_objects/" + this.databaseObject.id)
            });

            it("works when there is markup in the name (e.g. result from type ahead search", function() {
                this.databaseObject.set({objectName: "<em>a</em> space"})
                expect(this.databaseObject.showUrl()).toContain("/database_objects/" + this.databaseObject.id);
            })
        });

        context("when it is a view", function() {
            beforeEach(function() {
                this.databaseObject = rspecFixtures.databaseObject({objectType: "VIEW"});
            });

            it("uses the view exploration api", function() {
                var pieces = [
                    "#/database_objects",
                    this.databaseObject.id

                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.showUrl()).toMatchUrl(url);
            });
        });

        context("when it contains html", function() {
            it("removes the html", function() {
                this.databaseObject.set({ objectName: "<em>mmmm</em> good" });
                expect(this.databaseObject.showUrl()).toMatchUrl("#/database_objects/" + this.databaseObject.id);
            })
        })
    })

    describe("when the 'invalidated' event is triggered", function() {
        describe("when the databaseObject belongs to a collection", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatabaseObjectSet();
                this.collection.add(this.databaseObject);
            });

            it("re-fetches itself, because the last comment might have changed", function() {
                this.databaseObject.trigger("invalidated");
                expect(this.databaseObject).toHaveBeenFetched();
            });
        });

        describe("when the databaseObject has no collection", function() {
            it("does not fetch anything", function() {
                this.databaseObject.trigger("invalidated");
                expect(this.databaseObject).not.toHaveBeenFetched();
            });
        });
    });


    describe("#isChorusView", function() {
        it("is always false", function() {
            expect(this.databaseObject.isChorusView()).toBeFalsy();
        });
    });
});
