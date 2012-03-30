describe("chorus.dialogs.SandboxNewStandaloneMode", function() {
    beforeEach(function() {
        chorus.models.Config.instance().loaded = true;
        this.view = new chorus.views.SandboxNewStandaloneMode();
    });

    it("requires the Config object", function() {
        expect(this.view.requiredResources.models).toContain(chorus.models.Config.instance());
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("the default value of schema name to be public",function(){
            expect(this.view.$("input[name='schemaName']").val()).toBe("public");
        })
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
