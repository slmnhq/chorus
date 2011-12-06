describe("chorus.Modal", function() {
    beforeEach(function() {
        this.modal = new chorus.Modal();
    });

    describe("#attachPageModel", function() {
        it("does not have a pageModel before calling attachPageModel", function() {
            expect(this.modal.pageModel).toBeUndefined();
        });

        context("after calling #attachPageModel", function() {
            beforeEach(function() {
                spyOn(this.modal, 'bindPageModelCallbacks');
                this.model = new chorus.models.Base();
                this.modal.attachPageModel(this.model);
            });

            it("sets the pageModel property of the modal", function() {
                expect(this.modal.pageModel).toBe(this.model);
            });

            it("calls bindPageModelCallbacks", function() {
                expect(this.modal.bindPageModelCallbacks).toHaveBeenCalled();
            });
        });
    });
});