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

    describe("#columns", function() {
        it("should memoize the result", function() {
            expect(this.databaseObject.columns()).toBe(this.databaseObject.columns());
        });

        it("should return a DatabaseColumnSet", function() {
            expect(this.databaseObject.columns()).toBeA(chorus.collections.DatabaseColumnSet);
        })

        it("should pass the correct parameters to the DatabaseColumnSet", function() {
            var columns = this.databaseObject.columns();
            expect(columns.attributes.instanceId).toBe(this.databaseObject.get("instanceId"));
            expect(columns.attributes.databaseName).toBe(this.databaseObject.get("databaseName"));
            expect(columns.attributes.schemaName).toBe(this.databaseObject.get("schemaName"));
        });

        context("when the object is a table", function() {
            beforeEach(function() {
                this.databaseObject.set({ objectType: "SOURCE_TABLE" });
            });

            it("passes its name to the column set as 'tableName'", function() {
                var columns = this.databaseObject.columns();
                expect(columns.attributes.tableName).toBe(this.databaseObject.get("objectName"));
                expect(columns.attributes.viewName).toBeFalsy();
            });
        });

        context("when the object is a view", function() {
            beforeEach(function() {
                this.databaseObject.set({ objectType: "VIEW" });
            });

            it("passes its name to the column set as 'viewName'", function() {
                var columns = this.databaseObject.columns();
                expect(columns.attributes.viewName).toBe(this.databaseObject.get("objectName"));
                expect(columns.attributes.tableName).toBeFalsy();
            });
        });
    });
});
