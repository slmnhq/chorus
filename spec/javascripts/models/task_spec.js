describe("chorus.models.Task", function() {
    beforeEach(function() {
        this.model = fixtures.task({
            id: 1,
            instanceId: '5',
            databaseId: '6',
            schemaId: '7',
            sql: "show tables"
        });
    });

    it("has the right url", function() {
        var expectedUrl = "/edc/task/sync/";
        expect(this.model.url()).toMatchUrl(expectedUrl);
    });

    it("has the taskType of workfileSQLExecution by default", function(){
       expect(this.model.get("taskType")).toBe("workfileSQLExecution");
    })

    describe("#columnOrientedData", function() {
        beforeEach(function() {
            this.model = fixtures.task({ result: {
                columns: [{ name: "id" }, { name: "city" }, { name: "state" }, { name: "zip" }],
                rows: [
                    { id: 1 , city: "Oakland"   , state: "CA" , zip: "94612" } ,
                    { id: 2 , city: "Arcata"    , state: "CA" , zip: "95521" } ,
                    { id: 3 , city: "Lafayette" , state: "IN" , zip: "47909" }
                ]
            }});

            this.data = this.model.columnOrientedData();
        });

        it("returns an array with an element for each column", function() {
            expect(this.data.length).toBe(4);

            expect(this.data[0].name).toBe("id");
            expect(this.data[1].name).toBe("city");
            expect(this.data[2].name).toBe("state");
            expect(this.data[3].name).toBe("zip");
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
