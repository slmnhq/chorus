describe("chorus.models.DatabaseObject", function() {
    beforeEach(function() {
        this.databaseObject = fixtures.databaseObject();
    });

    describe("url", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseTable();
            });

            it("uses the table exploration api", function() {
                var pieces = [
                    "/edc/data",
                    this.databaseObject.get('instance').id,
                    "database",
                    this.databaseObject.get("databaseName"),
                    "schema",
                    this.databaseObject.get('schemaName'),
                    'table',
                    this.databaseObject.get('objectName')
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.url()).toMatchUrl(url);
            });
        });

        context("when it is a view", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseView();
            });

            it("uses the view exploration api", function() {
                var pieces = [
                    "/edc/data",
                    this.databaseObject.get('instance').id,
                    "database",
                    this.databaseObject.get("databaseName"),
                    "schema",
                    this.databaseObject.get('schemaName'),
                    'view',
                    this.databaseObject.get('objectName')
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.url()).toMatchUrl(url);
            });
        });
    });

    describe("showUrl", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseTable();
            });

            it("has the correct api", function() {
                var pieces = [
                    "#/instances",
                    this.databaseObject.get('instance').id,
                    "database",
                    this.databaseObject.get("databaseName"),
                    "schema",
                    this.databaseObject.get('schemaName'),
                    this.databaseObject.get('objectType'),
                    this.databaseObject.get('objectName')
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.showUrl()).toMatchUrl(url);
            });

            it("works when there is markup in the name (e.g. result from type ahead search", function() {
                this.databaseObject.set({objectName: "<em>foo</em>_bar"})
                var pieces = [
                    "#/instances",
                    this.databaseObject.get('instance').id,
                    "database",
                    this.databaseObject.get("databaseName"),
                    "schema",
                    this.databaseObject.get('schemaName'),
                    this.databaseObject.get('objectType'),
                    "foo_bar"
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.showUrl()).toMatchUrl(url);
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
                    "database",
                    this.databaseObject.get("databaseName"),
                    "schema",
                    this.databaseObject.get('schemaName'),
                    this.databaseObject.get('objectType'),
                    this.databaseObject.get('objectName')
                ]
                var url = encodeURI(pieces.join('/'));
                expect(this.databaseObject.showUrl()).toMatchUrl(url);
            });
        });

        context("when it contains html", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseTable({objectName: '<em>mmmm</em> good'});
            })

            it("removes the html", function() {
                expect(this.databaseObject.showUrl()).toMatchUrl("#/instances/12/database/database_name/schema/schema_name/BASE_TABLE/mmmm good");
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

    describe("#toText", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.databaseObject.set({objectName: "tabler", schemaName: "party_schema" })
            });

            it("formats the string to put into the sql editor", function() {
                expect(this.databaseObject.toText()).toBe('party_schema.tabler');
            });
        });

        context("with uppercase names", function() {
            beforeEach(function() {
                this.databaseObject.set({objectName: "Tabler", schemaName: "PartyMAN"});
            });

            it("puts quotes around the uppercase names", function() {
                expect(this.databaseObject.toText()).toBe('"PartyMAN"."Tabler"');
            });
        });
    });

    describe("#isChorusView", function() {
        it("is always false", function() {
            expect(this.databaseObject.isChorusView()).toBeFalsy();
        });
    });
});
