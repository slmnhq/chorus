describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.loadTemplate("copy_workfile");
        this.launchElement = $("<a data-workspace-id='4' data-workfile-id='10'></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.views, "CollectionPicklist")
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        })

        it("fetches a collection of workspaces", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/");
        })

        it("instantiates a CollectionPicklist with the workspace collection", function() {
            expect(chorus.views.CollectionPicklist).toHaveBeenCalledWith({ collection : this.dialog.collection });
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
