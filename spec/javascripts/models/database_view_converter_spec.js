describe("chorus.models.DatabaseViewConverter", function() {
    beforeEach(function() {
        this.from = fixtures.chorusView({id: "A|B|C"});
        this.from.get("workspace").id = 123;
        this.model = new chorus.models.DatabaseViewConverter({}, {from: this.from});
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/edc/workspace/123/dataset/A%7CB%7CC/convert");
    });
});