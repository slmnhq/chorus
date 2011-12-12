describe("chorus.Modal", function() {
    beforeEach(function() {
        spyOn(chorus.Modal.prototype, 'bindPageModelCallbacks');
        this.model = new chorus.models.Base();
        this.modal = new chorus.Modal({ pageModel : this.model });
        stubModals();
    });

    describe("#setup", function() {
        it("calls bindPageModelCallbacks", function() {
            expect(this.modal.bindPageModelCallbacks).toHaveBeenCalled();
        });
    });

    describe("#launchModal", function() {
        beforeEach(function() {
            //Modal is abstract, so we need to give it a template to render
            //this is the responsibility of subclasses
            this.loadTemplate("plain_text")
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
        });
    });
});
