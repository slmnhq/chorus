describe("chorus.models.Workfile", function() {
    beforeEach(function() {
        fixtures.model = "Workfile"
        this.workfile = fixtures.modelFor("fetch");
    });

    describe("#modifier", function() {
        it("returns a partially constructed user, based on the workfile's modifier attribute", function() {
            var modifier = this.workfile.modifier();
            expect(modifier.get("userName")).toBe(this.workfile.get("modifiedBy"));
            expect(modifier.get("firstName")).toBe(this.workfile.get("modifierFirstName"));
            expect(modifier.get("lastName")).toBe(this.workfile.get("modifierLastName"));
        });
    })
});