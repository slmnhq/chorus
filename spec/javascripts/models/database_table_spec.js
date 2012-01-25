describe("chorus.models.DatabaseTable", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseTable({name: "Tabler", instanceId: "33", databaseName: "dataman", schemaName: "partyman"});
    });

    it("should have the correct url template", function() {
        expect(this.model.url()).toBe("/edc/data/33/database/dataman/schema/partyman/table/Tabler");
    });

    describe("#columns", function() {
        it("should memoize the result", function() {
            expect(this.model.columns()).toBe(this.model.columns());
        });

        it("should return a DatabaseColumnSet", function() {
            expect(this.model.columns()).toBeA(chorus.collections.DatabaseColumnSet);
        })

        it("should pass the correct parameters to the DatabaseColumnSet", function() {
            var columns = this.model.columns();
            expect(columns.attributes.instanceId).toBe(this.model.get("instanceId"));
            expect(columns.attributes.databaseName).toBe(this.model.get("databaseName"));
            expect(columns.attributes.schemaName).toBe(this.model.get("schemaName"));
            expect(columns.attributes.tableName).toBe(this.model.get("name"));
        });
    });

    describe("#toString", function() {
        context("with lowercase names", function() {
            beforeEach(function() {
                this.model.set({name: "tabler"})
            });
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toString()).toBe('partyman.tabler');
            });
        });
        context("with uppercase names", function() {
            beforeEach(function() {
                this.model.set({name: "Tabler", schemaName: "PartyMAN"});
            });
            it("puts quotes around the uppercase names", function() {
                expect(this.model.toString()).toBe('"PartyMAN"."Tabler"');
            });
        });
    });
});
