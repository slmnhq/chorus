describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
        });

        it("returns the same instance when called multiple times", function() {
            expect(this.model.author()).toBe(this.model.author());
        });
    });

    context("type: WORKSPACE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_CREATED();
            this.workspace = this.model.get("workspace");
        });

        it("should have the right objectName", function() {
            expect(this.model.objectName()).toBe(this.workspace.name);
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.id}).showUrl();
            expect(this.model.objectUrl()).toBe(url);
        });
    });

    context("type: WORKSPACE_DELETED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_DELETED();
            this.workspace = this.model.get("workspace");
        });

        it("should have the right objectName", function() {
            expect(this.model.objectName()).toBe(this.workspace.name);
        });
    });
});
