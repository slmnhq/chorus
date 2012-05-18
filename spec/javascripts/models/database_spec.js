describe("chorus.models.Database", function() {
    beforeEach(function() {
        this.model = fixtures.database({ instance_id: '1', instance_name: "insta_whip", id: '2', name: "love_poems" });
    });

    describe("#urlTemplate", function() {
        it("should have the correct show url", function() {
            expect(this.model.showUrl()).toMatchUrl("#/databases/2");
        });
    });

    describe("#instance", function() {
        it("returns an instance with the right id and name", function() {
            expect(this.model.instance().id).toEqual('1');
            expect(this.model.instance().name()).toEqual('insta_whip');
        });
    });

    describe("#schemas", function() {
        beforeEach(function() {
            this.schemas = this.model.schemas();
        });

        it("returns a schema set with the right instance and database name and id", function() {
            expect(this.schemas).toBeA(chorus.collections.SchemaSet);
            expect(this.schemas.attributes.instance_id).toBe("1");
            expect(this.schemas.attributes.database_id).toBe("2");

            expect(this.schemas.attributes.instance_name).toBe("insta_whip");
            expect(this.schemas.attributes.database_name).toBe("love_poems");
        });

        it("memoizes", function() {
            expect(this.schemas).toBe(this.model.schemas());
        });
    });
});
