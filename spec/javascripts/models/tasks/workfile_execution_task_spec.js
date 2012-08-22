describe("chorus.models.WorkfileExecutionTask", function() {
    beforeEach(function() {
        this.workfile = rspecFixtures.workfile.sql({id: 1});
        this.model = new chorus.models.WorkfileExecutionTask({
            workfile: this.workfile,
            schemaId: '7',
            sql: "show tables"
        });
    });

    it("has the right URL", function() {
        expect(this.model.url()).toMatchUrl("/workfiles/1/executions");
    });

    it("name returns the name of the workfile", function() {
        expect(this.model.name()).toEqual(this.workfile.get("fileName"));
    });

    it("posts the correct data on save", function() {
        this.model.save();
        var params = this.server.lastCreate().params();
        expect(params['schema_id']).toEqual('7');
        expect(params['check_id']).toEqual(this.model.get("checkId"));
        expect(params['sql']).toEqual('show tables');
        expect(_.keys(params).length).toEqual(3);
    });

    describe("executionSchema", function() {
        beforeEach(function () {
            this.model.set({"executionSchema": rspecFixtures.schemaJson()});
        });

        it("returns the schema", function() {
            expect(this.model.executionSchema()).toBeA(chorus.models.Schema);
            expect(this.model.executionSchema().id).toEqual(this.model.get("executionSchema").id);
        });
    });

    it("mixes in SQLResults", function() {
        expect(this.model.columnOrientedData).toBeDefined();
    });

    it("sends schemaId when doing a destroy", function() {
        this.model.cancel();
        var params = this.server.lastDestroy().params();
        expect(params.schema_id).toBe('7');
    });

    describe("SQLResults support functions", function() {
        beforeEach(function() {
            this.columns = [ { name:"id" }, { name:"title"} ];
            this.rows = [ ['1', 'president'], ['2', 'vice president']];
            this.model = rspecFixtures.workfileExecutionResults({
                columns : this.columns,
                rows : this.rows
            })
            this.model.set({columns: this.columns});
        });

        describe("#getRows", function(){
            it("puts rows into the format columnOrientedData expects", function() {
                expect(this.model.getRows()).toEqual([
                    {id: "1", title: "president"},
                    {id: "2", title: "vice president"}
                ])
            });
        });

        describe("#getColumns", function(){
            it("returns the columns", function() {
                expect(this.model.getColumns()).toEqual(this.columns);
            })
        });
    });
});
