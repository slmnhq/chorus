describe("WorkfilesNewDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkfilesNew({workspaceId : 4})
        this.loadTemplate("workfiles_new")
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render()
        })

        it("has the right action url", function() {
            expect(this.dialog.$("form").attr("action")).toBe("/edc/workspace/4/workfile")
        })
    });

    describe("submit", function(){
      beforeEach(function() {
        this.dialog.render()
      })

      context("with invalid form values", function(){
        beforeEach(function(){
          this.dialog.$("form").submit()
        })

        xit("doesn't freak out'", function(){
          expect(this.dialog.model.get("fileName")).toBe("")
        })


      })

      context("with valid form values", function(){
        beforeEach(function(){
          this.dialog.$("input[name=fileName]").val("awesomesqlfile")
          this.dialog.$("form").submit()
        })

        it('sets the source to "empty"', function(){ //Of course it does.
          expect(this.dialog.model.get("source")).toBe("empty")
        })

        it("sets the fileName to the file name with extension", function(){
          expect(this.dialog.model.get("fileName")).toBe("awesomesqlfile.sql")
        })

        it("posts to the correct URL", function(){
          expect(this.server.requests[0].url).toBe("/edc/workspace/4/workfile")
        })

      })
    })
})
