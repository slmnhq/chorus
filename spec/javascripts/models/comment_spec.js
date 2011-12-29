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

    describe("#author", function() {
        beforeEach(function() {
            this.author = this.model.author();
        });

        it("returns a user with the right name", function() {
            expect(this.author.get("firstName")).toBe("LeBron");
            expect(this.author.get("lastName")).toBe("James");
        });

        it("memoizes", function() {
            expect(this.author).toBe(this.model.author());
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
