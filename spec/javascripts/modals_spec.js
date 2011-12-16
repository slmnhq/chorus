describe("chorus.Modal", function() {
    beforeEach(function() {
        spyOn(chorus.Modal.prototype, 'bindPageModelCallbacks');
        spyOn(chorus.Modal.prototype, 'unbindPageModelCallbacks');
        this.model = new chorus.models.Base();
        this.modal = new chorus.Modal({ pageModel : this.model });
        stubModals();
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

        it("calls bindPageModelCallbacks", function() {
            expect(this.modal.bindPageModelCallbacks).toHaveBeenCalled();
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
                $(document).trigger("close.facebox");
            });

            it("calls the 'close' hook", function() {
                expect(this.modal.close).toHaveBeenCalled();
            });

            it("deletes the chorus.modal object", function() {
                expect(chorus.modal).toBeUndefined()
            });

            it("calls unbindPageModelCallbacks", function() {
                expect(this.modal.unbindPageModelCallbacks).toHaveBeenCalled();
            })
        });
    });
});
