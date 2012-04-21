describe("chorus.models.DatabaseObject", function() {
    beforeEach(function() {
        this.databaseObject = newFixtures.databaseObject({
            instance: { id: 12 },
            databaseName: "beers",
            schemaName: "ipa",
            objectType: "BASE_TABLE"
        });
    });

    describe("url", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseTable({
                    databaseName: "%foo%",
                    schemaName: "b/a/r",
                    objectName: "a space"
                });
            });

            it("uses the table exploration api", function() {
                expect(this.databaseObject.url()).toContain("/edc/data/" + this.databaseObject.get("instance").id + "/database/%25foo%25/schema/b%2Fa%2Fr/table/a%20space")
            });
        });

        context("when it is a view", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseView({
                    databaseName: "%foo%",
                    schemaName: "b/a/r",
                    objectName: "a space"
                });
            });

            it("uses the table exploration api", function() {
                expect(this.databaseObject.url()).toContain("/edc/data/" + this.databaseObject.get("instance").id + "/database/%25foo%25/schema/b%2Fa%2Fr/view/a%20space")
            });
        });
    });

    describe("showUrl", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseTable({
                    databaseName: "%foo%",
                    schemaName: "b/a/r",
                    objectName: "a space"
                });
            });

            it("has the correct url", function() {
                expect(this.databaseObject.showUrl()).toContain("instances/" + this.databaseObject.get("instance").id + "/databases/%25foo%25/schemas/b%2Fa%2Fr/BASE_TABLE/a%20space")
            });

            it("works when there is markup in the name (e.g. result from type ahead search", function() {
                this.databaseObject.set({objectName: "<em>a</em> space"})
                expect(this.databaseObject.showUrl()).toContain("instances/" + this.databaseObject.get("instance").id + "/databases/%25foo%25/schemas/b%2Fa%2Fr/BASE_TABLE/a%20space");
            })
        });

        context("when it is a view", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseView();
            });

            it("uses the view exploration api", function() {
                var pieces = [
                    "#/instances",
                    this.databaseObject.get('instance').id,
                    "databases",
                    this.databaseObject.get("databaseName"),
                    "schemas",
                    this.databaseObject.get('schemaName'),
                    this.databaseObject.get('objectType'),
                    this.databaseObject.get('objectName')
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.showUrl()).toMatchUrl(url);
            });
        });

        context("when it contains html", function() {
            it("removes the html", function() {
                this.databaseObject.set({ objectName: "<em>mmmm</em> good" });
                expect(this.databaseObject.showUrl()).toMatchUrl("#/instances/12/databases/beers/schemas/ipa/BASE_TABLE/mmmm%20good");
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
