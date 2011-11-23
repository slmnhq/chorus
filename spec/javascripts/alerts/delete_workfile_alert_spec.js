describe("DeleteWorkfileAlert", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='10' data-workfile-id='100' data-workfile-name='foo.sql'></a>")
        this.alert = new chorus.alerts.DeleteWorkfile({ launchElement : this.launchElement });
        this.loadTemplate("alert")
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    })

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("workfile.delete.title", "foo.sql"))
    })

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("workfile.delete.text"))
    })

    describe("clicking delete", function() {
        beforeEach(function() {
            this.alert.render();
            spyOn(this.alert.model, "destroy");
            this.alert.$("button.submit").click();
        })

        it("deletes the workfile", function() {
            expect(this.alert.model.destroy).toHaveBeenCalled();
        });

        describe("when the workfile deletion is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.alert.model.trigger("destroy", this.alert.model);
            })

            it("dismisses the alert", function () {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            })

            it("navigates to the workfile list page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/workspaces/10/workfiles", true);
            });
        })

        describe("when the workfile deletion fails", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                this.alert.resource.set({serverErrors : [
                    { message: "Hi there" }
                ]});
                this.alert.model.trigger("destroyFailed", this.alert.model);
            })

            it("does not dismiss the dialog", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            })
        })
    })
})