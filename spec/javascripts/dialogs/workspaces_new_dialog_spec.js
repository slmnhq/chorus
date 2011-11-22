describe("WorkspacesNewDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkspacesNew();
        this.loadTemplate("workspaces_new")
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy();
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        })

        it("has a new workspace form", function() {
            expect(this.dialog.$("form.new_workspace")).toExist();
        })
    });

    describe("submitting the form", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("input[name=name]").val("Super Dataland");
            this.dialog.$("input[type=checkbox][name=isPublic]").attr("checked", "checked");
            this.dialog.$("form.new_workspace").submit();
        })

        it("fills in the workspace", function() {
            expect(this.dialog.resource.get("name")).toBe("Super Dataland")
            expect(this.dialog.resource.get("isPublic")).toBe(true)
        })

        it("sets isPublic to false when the box isn't checked", function() {
            this.dialog.$("input[type=checkbox][name=isPublic]").removeAttr("checked");
            this.dialog.$("form.new_workspace").submit();
            expect(this.dialog.resource.get("isPublic")).toBe(false)
        })

        it("saves the workspace", function() {
            spyOn(this.dialog.resource, "save")
            this.dialog.$("form.new_workspace").submit();
            expect(this.dialog.resource.save).toHaveBeenCalled()
        })

        context("when workspace creation is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.dialog.resource.set({ id: "10102" }, { silent: true })
                this.dialog.resource.trigger("saved");
            })

            it("redirects to the new workspace show page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/workspaces/10102", true);
            });

            it("dismisses the dialog", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            })
        })

        context("when workspace creation fails", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                this.dialog.resource.set({serverErrors : [
                    { message: "Hi there" }
                ]});
                this.dialog.resource.trigger("saveFailed");
            });

            it("displays the error message", function() {
                expect(this.dialog.$(".errors").text()).toContain("Hi there")
            });

            it("does not dismiss the dialog", function() {
                expect(this.dialog.$("form.new_workspace")).toExist();
            })

            it("doesn't navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            })
        })
    })
})