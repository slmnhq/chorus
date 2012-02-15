describe("WorkfilesSqlNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='4'></a>")
        this.dialog = new chorus.dialogs.WorkfilesSqlNew({launchElement : this.launchElement})
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

        it("starts with the submit button disabled", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        describe("filling out filename", function() {
            beforeEach(function() {
                this.dialog.$("input[name=fileName]").val("An hero.sql").keyup();
            });

            it("has enabled the submit button", function() {
                expect(this.dialog.$("button.submit")).not.toBeDisabled()
            })

            it("disables the button when the name is cleared", function() {
                this.dialog.$("input[name=fileName]").val("").keyup();
                expect(this.dialog.$("button.submit")).toBeDisabled()
            });
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

        it("doesn't freak out'", function(){
          expect(this.dialog.model.get("fileName")).toBe("")
        })
      })

      context("with valid form values", function(){
        beforeEach(function(){
          this.dialog.$("input[name=fileName]").val("   awesomesqlfile   ")
          this.dialog.$("form").submit()
        })

        it('sets the source to "empty"', function(){ //Of course it does.
          expect(this.dialog.model.get("source")).toBe("empty")
        })

        it("sets the fileName to the trimmed file name with extension", function(){
          expect(this.dialog.model.get("fileName")).toBe("awesomesqlfile.sql")
        })

        it("posts to the correct URL", function(){
          expect(this.server.requests[0].url).toBe("/edc/workspace/4/workfile")
        })

        it("puts the button in the loading state", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        context("when save is successful", function(){
          beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOnEvent($(document), "close.facebox");
            this.dialog.resource.set({ id: "10108" }, { silent: true })
            this.dialog.resource.trigger("saved");
          })

          it("redirects to the new workspace show page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/4/workfiles/10108", true);
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
