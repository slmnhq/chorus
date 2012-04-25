describe("chorus.models.DatabaseViewConverter", function() {
    beforeEach(function() {
        this.from = fixtures.chorusView({id: "A|B|C"});
        this.from.get("workspace").id = 123;
        this.model = new chorus.models.DatabaseViewConverter({}, {from: this.from});
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/workspace/123/dataset/A%7CB%7CC/convert");
    });

    describe("#databaseView", function() {
        beforeEach(function() {
            this.model.set({id: 'foo', workspace: {id: 25} })
        });

        it("has a link to the show page", function() {
            expect(this.model.databaseView().showUrl()).toEqual("#/workspaces/25/datasets/foo")
        });
    });
});