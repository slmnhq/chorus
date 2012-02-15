describe("chorus.models.Insight", function() {
    beforeEach(function() {
        this.model = new chorus.models.Insight({workspaceId: 5});
    });

    it("should have the correct url template", function() {
        expect(this.model.url()).toBe("/edc/insight/?workspaceId=5");
    });

    describe("saving the model", function() {
        beforeEach(function() {
            this.model.save({body: "This is the body"});
        });

        it("renames the post parameters", function() {
            var request = this.server.lastCreate();
            expect(request.params()['text']).toBe("This is the body");
        });
    })
});
