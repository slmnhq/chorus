describe("WorkfilesImportDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='4'></a>")
        this.dialog = new chorus.dialogs.WorkfilesImport({launchElement : this.launchElement});
        this.successfulResponse = {"result": '{"resource":[{"id":"9"}], "status": "ok"}'};
        this.errorResponse = {"result": '{"status": "fail", "message" :[{"message":"Workspace already has a workfile with this name. Specify a different name."}]}'};
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

        it("does not have the 'chosen' class on the form", function() {
            expect(this.dialog.$("form")).not.toHaveClass("chosen")
        });

        it("shows no file selected text", function() {
            expect(this.dialog.$(".file .defaultText")).not.toHaveClass("hidden")
        });
    });

    context("when a text file has been chosen", function() {
        context("when the upload completes", function() {
            beforeEach(function() {
                spyOn($.fn, 'fileupload');
                this.dialog.render();
                this.fileList = [
                    {name: 'foo.txt'}
                ];
                expect($.fn.fileupload).toHaveBeenCalled();
                var fileUploadArgs = $.fn.fileupload.mostRecentCall.args[0];

                fileUploadArgs.add(null, {files: this.fileList});

                spyOn(chorus.router, "navigate");
                fileUploadArgs.done(null, this.successfulResponse);
            });

            it("navigates to the workfile index", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.dialog.model.showUrl(), true);
            });
        });
    });

    context("when a file has been chosen", function() {
        beforeEach(function() {
            spyOn($.fn, 'fileupload');
            spyOn(this.dialog, "closeModal");
            this.dialog.render();
            this.fileList = [
                {
                    name: 'foo.bar'
                }
            ];
            expect($.fn.fileupload).toHaveBeenCalled();
            this.fileUploadOptions = $.fn.fileupload.mostRecentCall.args[0];
            this.request = jasmine.createSpyObj('request', ['abort']);
            this.fileUploadOptions.add(null, {files: this.fileList, submit: jasmine.createSpy().andReturn(this.request)});
        });

        it("enables the upload button", function() {
            expect(this.dialog.$("button.submit")).not.toHaveAttr("disabled");
        });


        it("does not put the button in loading mode", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
        });

        it("displays the chosen filename", function() {
            expect(this.dialog.$(".fileName").text()).toBe("foo.bar");
        });

        it("displays the appropriate file icon", function() {
            expect(this.dialog.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("bar", "medium"));
        });

        it("adds the 'chosen' class to the form", function() {
            expect(this.dialog.$("form")).toHaveClass("chosen")
        })

        it("hides the 'no file selected' text", function() {
            expect(this.dialog.$(".file .defaultText")).toHaveClass("hidden")
        });

        context("#upload", function() {
            beforeEach(function() {
                this.dialog.upload();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });

            it("puts the upload button in the loading state", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            });

            it("disables the upload button", function() {
                expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
            });

            it("changes the text on the upload button to 'uploading'", function() {
                expect(this.dialog.$("button.submit").text()).toBe(t("workfiles.import_dialog.uploading"));
            });

            context("when cancel is clicked before the upload completes", function() {
                beforeEach(function() {
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
                    $(document).trigger("close.facebox");
                });

                it("cancels the upload", function() {
                    expect(this.dialog.request.abort).toHaveBeenCalled();
                });
            });

            context("when the upload completes", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.fileUploadOptions.done(null, this.successfulResponse);
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
                    this.saveFailedSpy = jasmine.createSpy();
                    this.eventSpy = jasmine.createSpyObj("event", ['preventDefault']);
                    this.dialog.resource.bind("saveFailed", this.saveFailedSpy);
                    this.fileUploadOptions.done(this.eventSpy, this.errorResponse);
                });

                it("triggers saveFailed on the model", function(){
                    expect(this.saveFailedSpy).toHaveBeenCalled();
                });

                it("disables the upload button", function() {
                    expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
                });

                it("takes the upload button out of the loading state", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                });

                it("display the correct error" ,function(){
                    expect(this.dialog.$(".errors ul").text()).toBe("Workspace already has a workfile with this name. Specify a different name.")
                });

                it("sets the button text back to 'Uploading'", function(){
                    expect(this.dialog.$("button.submit").text()).toMatchTranslation("workfiles.button.import");
                });
            });
        });
        context("when the Enter key is pressed" , function() {
            beforeEach(function() {
                this.dialog.$("form").submit();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });
        });

        context("when the upload button is clicked" , function() {
            beforeEach(function() {
                this.dialog.$("button.submit").click();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });
        });
    });
})
