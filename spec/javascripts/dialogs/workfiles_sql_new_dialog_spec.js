describe("WorkfilesSqlNewDialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkfilesSqlNew({workspaceId : 4})
        this.loadTemplate("workfiles_sql_new")
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

        context("when save is successful", function(){
          beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOnEvent($(document), "close.facebox");
            this.dialog.resource.set({ id: "10108" }, { silent: true })
            this.dialog.resource.trigger("saved");
          })

          it("redirects to the new workspace show page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("/workspace/4/workfile/10108", true);
          });

          it("dismisses the dialog", function() {
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
          })
        })

        context("when save fails", function(){
          beforeEach(function(){
            this.dialog.model.trigger("saveFailed")
          })
        })
      })
    })
})
