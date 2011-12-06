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
        it("has the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.settings.title");
        });
        it("has an input for workspace name", function() {
            expect(this.dialog.$("input[name=name]").val()).toBe(this.dialog.model.get("name"))
        });
        it("has a text area for summary", function() {
           expect(this.dialog.$("textarea[name=summary]").val()).toBe(this.dialog.model.get("summary"));
        });
        context("submitting the form", function() {
            beforeEach(function() {
                this.spy = spyOn(this.dialog.model, "save");
                this.dialog.$("input[name=name]").val("my modified name");
                this.dialog.$("textarea[name=summary]").val("my modified summary");
                this.dialog.$('form').submit();
            })

            it("saves the workspace", function() {
                expect(this.spy).toHaveBeenCalled();
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.model.get("name")).toBe("my modified name");
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.model.get("summary")).toBe("my modified summary");
            })
        })
    })
})
