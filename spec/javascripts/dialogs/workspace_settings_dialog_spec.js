describe("WorkspaceSettings", function() {
    beforeEach(function() {
        this.launchElement = $("<a></a>");
        this.workspace = new chorus.models.Workspace({name: "my name", summary: "my summary", id: "457"});
        this.dialog = new chorus.dialogs.WorkspaceSettings({launchElement : this.launchElement, pageModel : this.workspace });
        this.loadTemplate("workspace_settings");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        it("has the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.settings.title");
        });
        it("has an input for workspace name", function() {
            expect(this.dialog.$("input[name=name]").val()).toBe(this.dialog.pageModel.get("name"))
        });
        it("has a text area for summary", function() {
            expect(this.dialog.$("textarea[name=summary]").val()).toBe(this.dialog.pageModel.get("summary"));
        });
        context("submitting the form with valid data", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                spyOn(this.dialog.pageModel, "save").andCallThrough();
                this.dialog.$("input[name=name]").val("my modified name");
                this.dialog.$("textarea[name=summary]").val("my modified summary");
                this.dialog.$('form').submit();
            })

            it("saves the workspace", function() {
                expect(this.dialog.pageModel.save).toHaveBeenCalled();
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.pageModel.get("name")).toBe("my modified name");
            });

            it("sets the name on the workspace", function() {
                expect(this.dialog.pageModel.get("summary")).toBe("my modified summary");
            });

            it("does not close the dialog before the server responds", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            });

            context("the server responds with success", function() {
                beforeEach(function() {
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"resource":[{"id":"9"}], "status": "ok"}']);
                    this.server.respond();
                });

                it("closes the dialog", function() {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document));
                });
            });

            context("the server responds with failure", function() {
                beforeEach(function() {
                    this.server.respondWith([200, {"Content-Type": "text/plain"}, '{"status": "fail", "message" : [{"message": "fake error message"}]}']);
                    this.server.respond();
                });

                it("does not close the dialog", function() {
                    expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                });

                it("displays the errors", function() {
                    expect(this.dialog.$(".errors").text()).toContain("fake error");
                });

                it("does not clear the form", function() {
                    expect(this.dialog.$("input[name=name]").val()).toBe("my modified name");
                });
            });
        });
        context("submitting the form with invalid data", function() {
            beforeEach(function() {
                this.validatedSpy = jasmine.createSpy("validated");
                this.dialog.pageModel.bind("validated", this.validatedSpy);
                this.validationFailedSpy = jasmine.createSpy("validationFailed");
                this.dialog.pageModel.bind("validationFailed", this.validationFailedSpy);
                this.dialog.$("input[name=name]").val("");
                this.dialog.$("textarea[name=summary]").val("my modified summary");
                this.dialog.$('form').submit();
            });

            it("triggers validation Failed", function() {
                expect(this.validationFailedSpy).toHaveBeenCalled();
            })

            it("does not set the name on the workspace", function() {
                expect(this.dialog.pageModel.get("name")).toBe("my name");
            });

            it("does not set the name on the workspace", function() {
                expect(this.dialog.pageModel.get("summary")).toBe("my summary");
            })
        })
    })
})
