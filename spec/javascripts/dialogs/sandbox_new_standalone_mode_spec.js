describe("chorus.dialogs.SandboxNewStandaloneMode", function() {
    beforeEach(function() {
        this.view = new chorus.views.SandboxNewStandaloneMode();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.dialogContainer = $("<div class='dialog sandbox_new'></div>").append(this.view.el);
            $('#jasmine_content').append(this.dialogContainer);
        });
    });

    describe("#fieldValues", function() {
        beforeEach(function() {
            this.view.render();
            this.view.$("input[name=instanceName]").val("my_instance");
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
