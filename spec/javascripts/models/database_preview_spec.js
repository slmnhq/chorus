describe("chorus.models.DatasetPreview", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatasetPreview({databaseName: "dataman", instanceId: "33", schemaName: "partyman"});
    });

    context("with a table name", function() {
        beforeEach(function() {
            this.model.set({tableName : "foo"});
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/data/33/database/dataman/schema/partyman/table/foo/sample");
        });
    });

    context("with a view name", function() {
        beforeEach(function() {
            this.model.set({viewName : "bar"});
        });
        it("should have the correct url template", function() {
            expect(this.model.url()).toBe("/edc/data/33/database/dataman/schema/partyman/view/bar/sample");
        });
    });

    describe("#columnOrientedData", function() {
        beforeEach(function() {
            this.model = fixtures.datasetPreview({
                columns: [
                    { name: "id",    typeCategory : "WHOLE_NUMBER" },
                    { name: "city",  typeCategory : "OTHER" },
                    { name: "state", typeCategory : "OTHER" },
                    { name: "zip",   typeCategory : "OTHER" }
                ],
                rows: [
                    { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                    { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                    { id: 3 , city: "Lafayette" , state: "IN" , zip: "47909" }
                ]
            });

            this.data = this.model.columnOrientedData();
        });

        it("returns an array with an element for each column", function() {
            expect(this.data.length).toBe(4);

            expect(this.data[0].name).toBe("id");
            expect(this.data[1].name).toBe("city");
            expect(this.data[2].name).toBe("state");
            expect(this.data[3].name).toBe("zip");
        });

        specify("each entry has a 'type' field", function() {
            expect(this.data[0].type).toBe("WHOLE_NUMBER");
            expect(this.data[1].type).toBe("OTHER");
        });

        specify("each entry has an array of all values for that column", function() {
            expect(this.data[0].values.length).toBe(3);
            expect(this.data[1].values.length).toBe(3);
            expect(this.data[2].values.length).toBe(3);
            expect(this.data[3].values.length).toBe(3);

            expect(this.data[0].values[0]).toBe(1);
            expect(this.data[0].values[1]).toBe(2);
            expect(this.data[0].values[2]).toBe(3);

            expect(this.data[1].values[0]).toBe("Oakland");
            expect(this.data[1].values[1]).toBe("Arcata");
            expect(this.data[1].values[2]).toBe("Lafayette");

            expect(this.data[2].values[0]).toBe("CA");
            expect(this.data[2].values[1]).toBe("CA");
            expect(this.data[2].values[2]).toBe("IN");

            expect(this.data[3].values[0]).toBe("94612");
            expect(this.data[3].values[1]).toBe("95521");
            expect(this.data[3].values[2]).toBe("47909");
        });
    });
});
