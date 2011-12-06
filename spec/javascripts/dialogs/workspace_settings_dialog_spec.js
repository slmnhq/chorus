describe("WorkspaceSettings", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-id='1'></a>");
        this.dialog = new chorus.dialogs.WorkspaceSettings({launchElement : this.launchElement});
        this.loadTemplate("workspace_settings");
        this.dialog.model.set({name: "my name", summary: "my summary"});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        it("should have the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.settings.title");
        });
        it("should have an input for workspace name", function() {
            expect(this.dialog.$("input[name=name]").val()).toBe(this.dialog.model.get("name"))
        });
        it("should have a text area for summary", function() {
           expect(this.dialog.$("textarea[name=summary]").val()).toBe(this.dialog.model.get("summary"));
        });
    })
})
