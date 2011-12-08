describe("chorus.Modal", function() {
    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.Modal.prototype, 'bindPageModelCallbacks');
            this.model = new chorus.models.Base();
            this.modal = new chorus.Modal({ pageModel : this.model });
        });

        it("calls bindPageModelCallbacks", function() {
            expect(this.modal.bindPageModelCallbacks).toHaveBeenCalled();
        });
    });
});
