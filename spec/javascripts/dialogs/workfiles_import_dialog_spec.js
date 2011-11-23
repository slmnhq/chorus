describe("WorkfilesImportDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkfilesImport({workspaceId : 4});
        this.loadTemplate("workfiles_import");
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

        context("clicking on the cancel button", function(){
            it("closes the dialog", function(){
                spyOn(this.dialog, "closeDialog");
                this.dialog.$("button.cancel").click();
                expect(this.dialog.closeDialog).toHaveBeenCalled();
            });
        });
    });

    context("when a file has been chosen", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeDialog");
            this.dialog.render();
            this.fileList = [{fileName: 'foo.txt'}];
            this.dialog.$("input[type=file]").fileupload('add', {files: this.fileList});
        });

        it("disables the upload button", function() {
            expect(this.dialog.$("button.submit").attr("disabled")).toBeUndefined();
        });

        it("does not display a spinner on the upload button", function() {
            expect(this.dialog.$("button.submit div[aria-role=progressbar]").length).toBe(0);
        });

        it("displays the chosen filename", function() {
            expect(this.dialog.$("span.fileName").text()).toBe("foo.txt");
        });

        it("displays the appropriate file icon", function() {
            expect(this.dialog.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("txt"));
        });

        context("when the submit is clicked", function() {
            beforeEach(function() {
                spyOn(this.dialog.uploadObj, "submit").andCallThrough();
                this.dialog.$("button.submit").click();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
                expect(this.server.requests[1].method).toBe("POST");
                expect(this.server.requests[1].url).toMatch(/\/edc\/workspace\/4\/workfile$/);
            });

            it("displays a spinner on the upload button", function() {
                expect(this.dialog.$("button.submit div[aria-role=progressbar]").length).toBe(1);
            });

            it("disables the upload button", function() {
                expect(this.dialog.$("button.submit").attr("disabled")).toBe("disabled");
            });

            context("when cancel is clicked before the upload completes", function(){
                beforeEach(function(){
                    spyOn(this.dialog.request, "abort");
                    this.dialog.$("button.cancel").click();
                });

                it("closes the dialog", function(){
                    expect(this.dialog.closeDialog).toHaveBeenCalled();
                });

                it("cancels the upload", function(){
                    expect(this.dialog.request.abort).toHaveBeenCalled();
                });
            });

            context("when the close 'X' is clicked", function(){
                beforeEach(function(){
                    spyOn(this.dialog.request, "abort");
                    $(document).trigger("close.facebox");
                });

                it("cancels the upload", function(){
                    expect(this.dialog.request.abort).toHaveBeenCalled();
                });
            });

            context("when the upload completes", function(){
                beforeEach(function(){
                    spyOn(chorus.router, "navigate");
                    // calls any 'done' callbacks
                    this.server.respondWith("OK");
                    this.server.respond();
                });

                it("closes the dialog", function(){
                    expect(this.dialog.closeDialog).toHaveBeenCalled();
                });

                it("navigates to the workfile index", function(){
                    expect(chorus.router.navigate).toHaveBeenCalledWith("/workspace/4/workfiles", true);
                });
            });
        });
    });
})
