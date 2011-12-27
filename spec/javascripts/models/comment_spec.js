describe("chorus.models.Comment", function() {
    beforeEach(function() {
        this.model = new chorus.models.Comment({
            body : "oh yes this is a party!",
            author : {
                id : "45",
                firstName : "LeBron",
                lastName : "James"
            }
        });
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("comment/{{entityType}}/{{entityId}}");
    });

    describe("validation", function() {
        it("should return a falsyy value if there is no body", function() {
            this.model.set({ body : "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a body", function() {
            this.model.set({ body : "foo" });
            expect(this.model.performValidation()).toBeTruthy();
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

    describe("saving the workfile attachments", function() {
        it("assigns the 'workfileIds' field as a comma-separated list of workfile ids", function() {
            this.model.workfiles = new chorus.models.WorkfileSet([
                new chorus.models.Workfile({ id: 44 }),
                new chorus.models.Workfile({ id: 45 }),
                new chorus.models.Workfile({ id: 46 })
            ]);

            this.model.save();

            expect(this.model.get("workfileIds")).toBe("44,45,46");
        });
    });
});
