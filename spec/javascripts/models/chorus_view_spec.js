describe("chorus.models.ChorusView", function() {
    beforeEach(function() {
        this.model = fixtures.chorusView();
    });

    it("extends Dataset", function() {
        expect(this.model).toBeA(chorus.models.Dataset);
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
            spyOn(this.model, "requireConfirmation").andCallThrough();
        });

        it("requires an object name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("objectName", undefined);
        })
    });
});
