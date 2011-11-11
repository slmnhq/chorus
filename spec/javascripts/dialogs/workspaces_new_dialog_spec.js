describe("WorkspacesNewDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkspacesNew();
        this.loadTemplate("workspaces_new")
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        })

        it("it's got a new workspace form", function(){
            expect(this.dialog.$("form.new_workspace")).toExist();
        })

        context("submitting the form", function() {
            beforeEach(function(){
                this.dialog.$("input[name=name]").val("Super Dataland");
                this.dialog.$("input[type=checkbox][name=isPublic]").attr("checked", "checked");
            })

            it("creates a workspace", function() {
                this.dialog.$("form.new_workspace").submit();
                expect(this.dialog.resource.get("name")).toBe("Super Dataland")
                expect(this.dialog.resource.get("isPublic")).toBe(true)
            })

            it("sets isPublic to false when the box isn't checked", function(){
                this.dialog.$("input[type=checkbox][name=isPublic]").removeAttr("checked");
                this.dialog.$("form.new_workspace").submit();
                expect(this.dialog.resource.get("isPublic")).toBe(false)
            })

            it("saves the workspace", function() {
                var workspace = new chorus.models.Workspace();
                var dialog = new chorus.dialogs.WorkspacesNew({ model : workspace });
                dialog.render();

                spyOn(workspace, "save")
                dialog.$("form.new_workspace").submit();
                expect(workspace.save).toHaveBeenCalled()
            })

            context("when workspace creation is successful", function() {
                beforeEach(function() {
                    this.dialog.$("form.new_workspace").submit();
                    spyOn(chorus.router, "navigate");
                    spyOnEvent($(document), "close.facebox");
                    this.dialog.resource.trigger("saved");
                })

                it("redirects to workspaces index", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith("/workspaces", true);
                });

                it("dismisses the dialog", function() {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document))
                })
            })

            context("when workspace creation fails", function() {
                beforeEach(function() {
                    this.dialog.$("form.new_workspace").submit();
                    spyOn(chorus.router, "navigate");
                    this.dialog.resource.set({ errors : [
                        { message: "Hi there" }
                    ] });
                });

                it("displays the error message", function() {
                    expect(this.dialog.$(".errors").text()).toContain("Hi there")
                });

                it ("does not dismiss the dialog", function() {
                    expect(this.dialog.$("form.new_workspace")).toExist();
                })

                it("doesn't navigate", function() {
                    expect(chorus.router.navigate).not.toHaveBeenCalled();
                })
            })
        })
    })
})