describe("chorus.models.Instance", function() {
    beforeEach(function() {
        fixtures.model = "Instance";
        this.instance = fixtures.modelFor("fetch");
    });

    it("has a valid showUrl", function() {
        expect(this.instance.showUrl()).toBe("#/instances/10000");
    });

    it("has a valid url", function() {
        expect(this.instance.url()).toBe("/edc/instance/10000");
    });

    describe("#owner", function() {
        it("returns a user", function() {
            var owner = this.instance.owner();
            expect(owner.get("id")).toBe("10111");
            expect(owner.get("userName")).toBe("edcadmin");
            expect(owner.get("fullName")).toBe("EDC Admin");
        })
    })
});