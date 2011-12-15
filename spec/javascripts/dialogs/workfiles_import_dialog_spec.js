describe("WorkfilesImportDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='4'></a>")
        this.dialog = new chorus.dialogs.WorkfilesImport({launchElement : this.launchElement});
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render()
        });

        it("has the right action url", function() {
            expect(this.dialog.$("form").attr("action")).toBe("/edc/workspace/4/workfile");
        });

        it("disables the upload button", function() {
            expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
        });

        context("clicking on the cancel button", function() {
            it("closes the dialog", function() {
                spyOn(this.dialog, "closeModal");
                this.dialog.$("button.cancel").click();
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });

    context("when a text file has been chosen", function() {
        context("when the upload completes", function() {
            beforeEach(function() {
                this.dialog.render();
                this.fileList = [
                    {fileName: 'foo.txt'}
                ];
                this.dialog.$("input[type=file]").fileupload('add', {files: this.fileList});
                this.dialog.$("button.submit").click();

                spyOn(chorus.router, "navigate");
                // calls any 'done' callbacks
                this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"resource":[{"id":"9"}], "status": "ok"}']);
                this.server.respond();
            });

            it("navigates to the workfile index", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.model.showUrl(), true);
            });
        });
    });

    context("when a file has been chosen", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeModal");
            this.dialog.render();
            this.fileList = [
                {fileName: 'foo.bar'}
            ];
            this.dialog.$("input[type=file]").fileupload('add', {files: this.fileList});
        });

        it("disables the upload button", function() {
            expect(this.dialog.$("button.submit").attr("disabled")).toBeUndefined();
        });

        it("does not display a spinner on the upload button", function() {
            expect(this.dialog.$("button.submit div[aria-role=progressbar]").length).toBe(0);
        });

        it("displays the chosen filename", function() {
            expect(this.dialog.$("span.fileName").text()).toBe("foo.bar");
        });

        it("displays the appropriate file icon", function() {
            expect(this.dialog.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("bar"));
        });

        context("#upload", function() {
            beforeEach(function() {
                spyOn(this.dialog.uploadObj, "submit").andCallThrough();
                this.dialog.upload();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
                expect(_.last(this.server.requests).method).toBe("POST");
                expect(_.last(this.server.requests).url).toMatch(/\/edc\/workspace\/4\/workfile$/);
            });

            it("displays a spinner on the upload button", function() {
                expect(this.dialog.$("button.submit div[aria-role=progressbar]").length).toBe(1);
            });

            it("disables the upload button", function() {
                expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
            });

            it("adds the expanded class to the upload button", function() {
                expect(this.dialog.$("button.submit")).toHaveClass("expanded");
            });

            it("changes the text on the upload button to 'uploading'", function() {
                expect(this.dialog.$("button.submit").text()).toBe(t("workfiles.import_dialog.uploading"));
            });

            context("when cancel is clicked before the upload completes", function() {
                beforeEach(function() {
                    spyOn(this.dialog.request, "abort");
                    this.dialog.$("button.cancel").click();
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("cancels the upload", function() {
                    expect(this.dialog.request.abort).toHaveBeenCalled();
                });
            });

            context("when the close 'X' is clicked", function() {
                beforeEach(function() {
                    spyOn(this.dialog.request, "abort");
                    $(document).trigger("close.facebox");
                });

                it("cancels the upload", function() {
                    expect(this.dialog.request.abort).toHaveBeenCalled();
                });
            });

            context("when the upload completes", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    // calls any 'done' callbacks
                    this.server.respondWith("OK");
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"resource":[{"id":"9"}],"status": "ok"}']);
                    this.server.respond();
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("navigates to the workfile index", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/4/workfiles", true);
                });
            });

            context("when the upload gives a server error", function() {
                beforeEach(function() {
                    spyOn(this.dialog.request, "abort");
                    this.saveFailedSpy = jasmine.createSpy();
                    this.dialog.resource.bind("saveFailed", this.saveFailedSpy);
                    // calls any 'done' callbacks
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"status": "fail", "message" :[{"message":"Workspace already has a workfile with this name. Specify a different name."}]}']);
                    this.server.respond();
                });

                it("triggers saveFailed on the model", function(){
                    expect(this.saveFailedSpy).toHaveBeenCalled();
                });

                it("disables the upload button", function() {
                    expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
                });

                it("does not display a spinner on the upload button", function() {
                    expect(this.dialog.$("button.submit div[aria-role=progressbar]").length).toBe(0);
                });

                it("display the correct error" ,function(){
                    expect(this.dialog.$(".errors").text()).toBe("Workspace already has a workfile with this name. Specify a different name.")
                });

                it("sets the button text back to 'Uploading'", function(){
                    expect(this.dialog.$("button.submit").text()).toMatchTranslation("workfiles.button.import");
                });

                it("removes the expanded class from the button", function(){
                    expect(this.dialog.$("button.submit")).not.toHaveClass("expanded");
                });
            });
        });
        context("when the Enter key is pressed" , function() {
            beforeEach(function() {
                spyOn(this.dialog.uploadObj, "submit").andCallThrough();
                this.dialog.$("form").submit();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });
        });

        context("when the upload button is clicked" , function() {
            beforeEach(function() {
                spyOn(this.dialog.uploadObj, "submit").andCallThrough();
                this.dialog.$("button.submit").click();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });
        });
    });
})
