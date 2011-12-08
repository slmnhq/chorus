describe("chorus.models.Comment", function() {
    beforeEach(function() {
        this.model = new chorus.models.Comment({
            body : "oh yes this is a party!",
            creatorFirstName : "LeBron",
            creatorLastName : "James",
            creatorId : "45"
        });
    });

    describe("#creator", function() {
        beforeEach(function() {
            this.creator = this.model.creator();
        });

        it("returns a user with the right name", function() {
            expect(this.creator.get("firstName")).toBe("LeBron");
            expect(this.creator.get("lastName")).toBe("James");
        });

        it("memoizes", function() {
            expect(this.creator).toBe(this.model.creator());
        });
    });
});
