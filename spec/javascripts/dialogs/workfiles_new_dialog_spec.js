describe("WorkfilesNewDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkfilesNew({workspaceId : 4});
        this.loadTemplate("workfiles_new")
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy();
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        })

        it("has the right action url", function() {
            expect(this.dialog.$("form").attr("action")).toBe("/edc/workspace/4/workfile");
        })
    });
})
