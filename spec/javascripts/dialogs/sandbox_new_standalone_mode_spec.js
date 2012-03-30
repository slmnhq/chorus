describe("chorus.dialogs.SandboxNewStandaloneMode", function() {
    beforeEach(function() {
        chorus.models.Config.instance().loaded = true;
        this.view = new chorus.views.SandboxNewStandaloneMode();
    });

    it("requires the Config object", function() {
        expect(this.view.requiredResources.models).toContain(chorus.models.Config.instance());
    });

    describe("#render (normal)", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("sets the default value of schema name to be public",function(){
            expect(this.view.$("input[name='schemaName']").val()).toBe("public");
        })

        it("renders the description field", function() {
            expect(this.view.$("textarea")).toExist();
        });

        it("calls the name 'name'", function() {
            expect(this.view.$("input[name='name']")).toExist();
            expect(this.view.$("input[name='instanceName']")).not.toExist();
        });
    });

    describe("#render (adding_sandbox mode)", function() {
        beforeEach(function() {
            this.view.options.addingSandbox = true;
            this.view.render();
        });

        it("sets the default value of schema name to be public",function(){
            expect(this.view.$("input[name='schemaName']").val()).toBe("public");
        })

        it("does not render the description field", function() {
            expect(this.view.$("textarea")).not.toExist();
        });

        it("calls the name 'instanceName'", function() {
            expect(this.view.$("input[name='name']")).not.toExist();
            expect(this.view.$("input[name='instanceName']")).toExist();
        });
    });

    describe("#fieldValues", function() {
        beforeEach(function() {
            this.view.render();
            this.view.$("input[name=name]").val("my_instance");
            this.view.$("input[name=databaseName]").val("my_database");
            this.view.$("input[name=schemaName]").val("my_schema");
            this.view.$("input[name=size]").val("5");
        });

        it("returns the entered instance name, database name, schema name and size", function() {
            expect(this.view.fieldValues()).toEqual({
                instanceName: 'my_instance',
                databaseName: 'my_database',
                schemaName: 'my_schema',
                size: '5'
            });
        });
    });
});
