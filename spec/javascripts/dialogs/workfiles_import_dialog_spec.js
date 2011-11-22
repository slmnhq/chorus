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
    });

    describe("submit", function(){
      beforeEach(function() {
        this.dialog.render()
      })

      context("with invalid form values", function(){
      })

      context("with valid form values", function(){
      })
    })
})
