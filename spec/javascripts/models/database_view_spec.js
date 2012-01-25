describe("chorus.models.DatabaseView", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseView({name: "View1", instanceId: "33", databaseName: "dataman", schemaName: "partyman"});
    });

    it("should have the correct url template", function() {
        expect(this.model.url()).toBe("/edc/data/33/database/dataman/schema/partyman/view/View1");
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
            expect(columns.attributes.viewName).toBe(this.model.get("name"));
        });
    });

    describe("#toText", function() {
        context("with lowercase name", function() {
            beforeEach(function() {
                this.model.set({name: "view1"});
            })
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toText()).toBe('partyman.view1');
            })
        })
        context("with uppercase name", function() {
            beforeEach(function() {
                this.model.set({name: "View1", schemaName: "PartyMan"});
            })
            it("formats the string to put into the sql editor", function() {
                expect(this.model.toText()).toBe('"PartyMan"."View1"');
            })
        })
    })
});
