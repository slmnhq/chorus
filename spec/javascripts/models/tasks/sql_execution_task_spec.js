describe("chorus.models.SqlExecutionTask", function() {
    beforeEach(function() {
        this.model = fixtures.task({
            id: 1,
            instanceId: '5',
            databaseId: '6',
            schemaId: '7',
            sql: "show tables"
        });
    });

    it("has the right task type", function(){
       expect(this.model.get("taskType")).toBe("workfileSQLExecution");
    })

    it("mixes in SQLResults", function() {
        expect(this.model.errorMessage).toBeDefined();
        expect(this.model.columnOrientedData).toBeDefined();
    })

    describe("SQLResults support functions", function() {
        beforeEach(function() {
            this.columns = [ { name:"id" } ];
            this.rows = [ { id: 1 }];
            this.model = new chorus.models.SqlExecutionTask({ result : {
                columns : this.columns,
                rows : this.rows,
                executeResult : "failed",
                message : "This is broken!"
            }})
        });

        describe("#getRows", function(){
            it("returns the rows", function() {
                expect(this.model.getRows()).toEqual(this.rows);
            })
        })

        describe("#getColumns", function(){
            it("returns the columns", function() {
                expect(this.model.getColumns()).toEqual(this.columns);
            })
        })

    });
});
