describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.loadTemplate("copy_workfile");
        this.loadTemplate("collection_picklist");
        this.launchElement = $("<a data-workspace-id='4' data-workfile-id='10'></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        })

        it("fetches a collection of workspaces", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/");
        })

        it("instantiates a CollectionPicklist with the workspace collection", function() {
            expect(this.dialog.picklistView.collection).toBe(this.dialog.collection);
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            spyOn(this.dialog.picklistView, "render");
            this.dialog.render();
        })

        it("renders the picklist view", function() {
            expect(this.dialog.picklistView.render).toHaveBeenCalled();
        })
    })

    describe("copy file button", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            this.dialog.render();
        })

        it("is initially disabled", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        })

        describe("when an item is selected", function() {
            beforeEach(function() {
                this.dialog.picklistView.trigger("item:selected", true);
            })

            it("should enable the button", function(){
                expect(this.dialog.$("button.submit")).not.toBeDisabled();
            })

            describe("and it is subsequently deselected", function() {
                beforeEach(function() {
                    this.dialog.picklistView.trigger("item:selected", undefined);
                })

                it("should disable the button", function(){
                    expect(this.dialog.$("button.submit")).toBeDisabled();
                })
            })

        })
    })

//    context("when a workspace has been chosen", function() {
//        beforeEach(function() {
//            this.dialog.render();
//            this.dialog.selectedIndex = 2;
//            this.dialog.$("input[type=file]").fileupload('add', {files: this.fileList});
//        });
//
//        context("when the submit is clicked", function() {
//            it("closes the dialog", function() {
//                expect(this.dialog.closeDialog).toHaveBeenCalled();
//            });
//
//            it("navigates to the workfile index", function() {
//                expect(chorus.router.navigate).toHaveBeenCalledWith("/workspace/4/workfiles", true);
//            });
//        });
//    });
})
