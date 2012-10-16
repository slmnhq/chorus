describe("ImportGnipStream", function () {
    beforeEach(function () {
        this.gnip = rspecFixtures.gnipInstance({id: 123});
        this.dialog = new chorus.dialogs.ImportGnipStream({pageModel: this.gnip});
    });

    it("uses a GnipStream model", function() {
       expect(this.dialog.resource).toBeA(chorus.models.GnipStream);
    });

    it("set the gnip_instance_id in the model", function() {
        expect(this.dialog.model.get("gnip_instance_id")).toBe(123);
    });

    describe("render", function () {
        beforeEach(function () {
            this.dialog.render();
        });
        it("has the correct title", function () {
            expect(this.dialog.$("h1")).toContainTranslation("gnip.import_stream.title");
        });

        it("has 'import into a sandbox' fieldset legend", function() {
           expect(this.dialog.$("fieldset legend")).toContainTranslation("gnip.import_stream.import_into_sandbox");
           expect(this.dialog.$("fieldset legend a.select_workspace")).toContainTranslation("gnip.import_stream.select_workspace");
        });

        it("disable the button if workspace and new table is still empty", function () {
            expect(this.dialog.$(".submit")).toBeDisabled();
        });

        describe("clicking on Select workspace link", function () {
            beforeEach(function () {
                this.modalSpy = stubModals();
                this.dialog.$("a.select_workspace").click();
            });

            it("should launch the select workspace picker dialog", function() {
                expect(this.modalSpy.lastModal()).toBeA(chorus.dialogs.ImportStreamWorkspacePicker);
            });

            describe("after workspace is selected", function () {
                beforeEach(function () {
                    this.workspace = rspecFixtures.workspace({name: "WorkspaceForGnip"});
                    this.dialog.workspace_picker.trigger("workspace:selected", this.workspace);
                });
                it("updates the workspace selection link", function () {
                    expect(this.dialog.$("legend a")).toHaveText("WorkspaceForGnip");
                });

                context("clicking on submit", function () {
                    beforeEach(function () {
                        spyOn(this.dialog.model, "save").andCallThrough();
                        this.dialog.$("input[name=toTable]").val("MyNewTable").keyup();
                        this.dialog.$(".submit").click();
                    });
                    it("calls save on the model", function () {
                        expect(this.dialog.model.get("workspaceId")).toBe(this.workspace.id);
                        expect(this.dialog.model.get("toTable")).toBe("MyNewTable");
                        expect(this.dialog.model.save).toHaveBeenCalled();
                    });

                    it("shows the loading button", function () {
                        expect(this.dialog.$(".submit").isLoading()).toBeTruthy();
                    });

                    context("when save is successful", function() {
                        beforeEach(function () {
                            spyOn(chorus, "toast");
                            spyOnEvent($(document), "close.facebox");
                            this.server.completeSaveFor(this.dialog.model);
                        });
                        it("closes the dialog", function() {
                            expect("close.facebox").toHaveBeenTriggeredOn($(document))
                        });

                        it("display a toast message", function () {
                            expect(chorus.toast).toHaveBeenCalledWith("gnip.import_stream.toast.start_import");
                        });
                    });

                    context("when save is unsuccessful", function() {
                        beforeEach(function () {
                            this.dialog.model.set({serverErrors : { fields: { a: { GENERIC: {message: "abc"} } } }});
                            this.dialog.model.trigger("saveFailed");
                        });

                        it("stops the 'loading' submit button", function () {
                            expect(this.dialog.$(".submit").isLoading()).toBeFalsy();
                        });

                        it("populates the dialog's errors div", function() {
                            expect(this.dialog.$(".errors").text()).toContain("abc");
                        });
                    });

                    context("when model is invalid", function() {
                        beforeEach(function () {
                            this.dialog.model.trigger("validationFailed");
                        });

                        it("stops the 'loading' submit button", function () {
                            expect(this.dialog.$(".submit").isLoading()).toBeFalsy();
                        });
                    });
                });
            });
        });
    });

});