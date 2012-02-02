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
        expect(this.model.columnOrientedData).toBeDefined();
    })

    describe("SQLResults support functions", function() {
        beforeEach(function() {
            this.columns = [ { name:"id" } ]
            this.rows = [ { id: 1 }];
            this.model = new chorus.models.SqlExecutionTask({ result : {
                columns : this.columns,
                rows : this.rows
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

    describe("#errorMessage", function() {
        it("should return errors if they exist", function() {
            var task = fixtures.taskWithErrors();
            expect(task.errorMessage()).toBe(task.get('result').message);
        })

        it("should return falsy when the response is successful and has no message", function() {
            var task = fixtures.taskWithResult();
            expect(task.errorMessage()).toBeFalsy();
        })

        it("returns falsy when the response is successful, but has a warning message", function() {
            var task = fixtures.taskWithResult({
                result: { executeResult: "success", message: "this is just a warning, bro. not to worry." }
            });
            expect(task.errorMessage()).toBeFalsy();
        });
    })
});
