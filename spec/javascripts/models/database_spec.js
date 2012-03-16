describe("chorus.models.Database", function() {
    beforeEach(function() {
        this.model = fixtures.database({ instanceId: '1', instanceName: "insta_whip", id: '2', name: "love_poems" });
    });

    it("should have the correct show url", function() {
        expect(this.model.showUrl()).toMatchUrl("#/instances/1/databases/love_poems");
    });

    describe("#schemas", function() {
        beforeEach(function() {
            this.schemas = this.model.schemas();
        });

        it("returns a schema set with the right instance and database name and id", function() {
            expect(this.schemas).toBeA(chorus.collections.SchemaSet);
            expect(this.schemas.attributes.instanceId).toBe("1");
            expect(this.schemas.attributes.databaseId).toBe("2");

            expect(this.schemas.attributes.instanceName).toBe("insta_whip");
            expect(this.schemas.attributes.databaseName).toBe("love_poems");
        });

        it("memoizes", function() {
            expect(this.schemas).toBe(this.model.schemas());
        });
    });
});
