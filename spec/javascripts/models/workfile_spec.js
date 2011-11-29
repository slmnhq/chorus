describe("chorus.models.Workfile", function() {
    beforeEach(function() {
        fixtures.model = "Workfile"
        this.model = fixtures.modelFor("fetch");
    });

    describe("#modifier", function() {
        it("returns a partially constructed user, based on the workfile's modifier attribute", function() {
            var modifier = this.model.modifier();
            expect(modifier.get("userName")).toBe(this.model.get("modifiedBy"));
            expect(modifier.get("firstName")).toBe(this.model.get("modifierFirstName"));
            expect(modifier.get("lastName")).toBe(this.model.get("modifierLastName"));
        });
    })

    describe("#performValidation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires fileName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("fileName");
        });
    });

    describe("#initialize", function() {
        beforeEach(function() {
            this.model = new chorus.models.Workfile({id: 5, workspaceId: 10})
        });

        it("constructs the right backend URL", function() {
            expect(this.model.url()).toBe("/edc/workspace/10/workfile/5");
            expect(this.model.url(true)).toBe("workspace/10/workfile/5");
        });

        it("constructs the right frontend show URL", function() {
            expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5");
            expect(this.model.showUrl(true)).toBe("workspaces/10/workfiles/5");
        });
    });
});
