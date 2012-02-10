describe("chorus.models.DatabaseObject", function() {
    beforeEach(function() {
        this.databaseObject = fixtures.databaseObject();
    });

    describe("url", function() {
        context("when it is a table", function() {
            beforeEach(function() {
                this.databaseObject = fixtures.databaseObjectAsTable();
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
                this.databaseObject = fixtures.databaseObjectAsView();
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
});