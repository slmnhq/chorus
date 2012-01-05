describe("chorus.models.Sandbox", function() {
    beforeEach(function() {
        this.model = new chorus.models.Sandbox({ workspaceId: '123', id: '456' });
    });

    describe("#url", function() {
        context("when creating", function() {
            it("has the right url", function() {
                var uri = new URI(this.model.url({ method: "create" }));
                expect(uri.path()).toBe("/edc/workspace/123/sandbox");
            });
        });
    });

    describe("#beforeSave", function() {
        it("sets the 'type' field as required by the api", function() {
            this.model.save({ instance: '22', database: '11', schema: '33' });
            expect(this.model.get("type")).toBe("000");

            this.model.clear();
            this.model.save({ instance: '22', database: '11' });
            expect(this.model.get("type")).toBe("001");

            this.model.clear();
            this.model.save({ database: '11', schema: '33' });
            expect(this.model.get("type")).toBe("100");

            this.model.clear();
            this.model.save();
            expect(this.model.get("type")).toBe("111");
        });
    });
});
