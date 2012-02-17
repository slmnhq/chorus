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
        });

        it("requires an object name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("objectName", undefined, "dataset.chorusview.validation.object_name_required");
        })

        it("enforces object name constraints", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("objectName", /^[a-zA-Z][a-zA-Z0-9_]*/, undefined, "dataset.chorusview.validation.object_name_pattern");
        })
    });
});
