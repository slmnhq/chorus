describe("chorus.models.Note", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Note';
        this.model = new models.Note();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("comment/{{entityType}}/{{entityId}}");
    });

    describe("#performValidation", function() {
        it("should return a falsyy value if there is no body", function() {
            this.model.set({ body : "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a body", function() {
            this.model.set({ body : "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });
    });
});
