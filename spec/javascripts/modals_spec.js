describe("chorus.Modal", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base();
        this.modal = new chorus.Modal({ pageModel : this.model });
        stubModals();
    });

    it("has the right constructor name (for console output)", function() {
        var modal = new (chorus.Modal.extend({}));
        expect(modal.constructor.name).toBe("chorus$Modal");
    });

    describe("intialization", function() {
        context("when a model option is provided", function() {
            it("sets the model on the view", function() {
                var otherModel = new chorus.models.User({ id: 1 });
                this.modal = new chorus.Modal({ pageModel : this.model, model : otherModel });
                expect(this.modal.model).toBe(otherModel);
            });
        });

        context("when no model is passed", function() {
            it("sets the model to the pageModel", function() {
                expect(this.modal.model).toBe(this.model);
            });
        });

        it("sets the pageModel", function() {
            expect(this.modal.pageModel).toBe(this.model);
        });
    });

    describe("#launchModal", function() {
        beforeEach(function() {
            //Modal is abstract, so we need to give it a template to render
            //this is the responsibility of subclasses
            this.modal.className = "plain_text"

            this.modal.launchModal();
        });

        it("sets chorus.modal", function(){
           expect(chorus.modal).toBe(this.modal)
        })

        describe("when the facebox closes", function() {
            beforeEach(function() {
                spyOn(this.modal, 'close');
                $("#jasmine_content").append("<div id='facebox'/>")
                $.facebox.settings.inited = true;
                $(document).trigger("close.facebox");
            });

            it("calls the 'close' hook", function() {
                expect(this.modal.close).toHaveBeenCalled();
            });

            it("deletes the chorus.modal object", function() {
                expect(chorus.modal).toBeUndefined()
            });

            it("resets facebox", function() {
                expect($.facebox.settings.inited).toBeFalsy();
            })

            it("removes the #facebox element from the DOM", function() {
                expect($("#facebox")).not.toExist();
            })
        });
    });

    describe("launching a sub modal", function() {
        beforeEach(function() {
            this.modal.className = "plain_text"
            this.modal.launchModal();
            this.faceboxProxy = $("<div id='facebox'/>");
            this.faceboxOverlayProxy = $("<div id='facebox_overlay'/>");
            $("#jasmine_content").append(this.faceboxProxy).append(this.faceboxOverlayProxy);
            this.subModal = new chorus.Modal({ pageModel : this.model });
            this.subModal.className = "plain_text"
            spyOn(this.subModal, "launchModal");
            $.facebox.settings.inited = true;
            this.modal.launchSubModal(this.subModal)
        })

        it("changes the id on the existing dialog to something other than #facebox", function() {
            expect(this.faceboxProxy.attr("id")).not.toBe("facebox");
            expect(this.faceboxOverlayProxy.attr("id")).not.toBe("facebox_overlay");
        })

        it("adds the 'hidden' class to the existing dialog", function() {
            expect(this.faceboxProxy).toHaveClass("hidden")
        })

        it("resets facebox", function() {
            expect($.facebox.settings.inited).toBeFalsy();
        })

        it("launches the sub modal", function() {
            expect(this.subModal.launchModal).toHaveBeenCalled();
        })

        xdescribe("when the sub modal is closed", function() {
            beforeEach(function() {
                $(document).trigger("close.facebox");
            });

            it("restores the ids on the preceeding dialog", function() {
                expect(this.faceboxProxy.attr("id")).toBe("facebox");
                expect(this.faceboxOverlayProxy.attr("id")).toBe("facebox_overlay");
            })

            it("removes the 'hidden' class from the preceeding dialog", function() {
                expect(this.faceboxProxy).not.toHaveClass("hidden");
            })
        })
    })
});
