describe("chorus.models.DatabaseViewConverter", function() {
    beforeEach(function() {
        this.from = fixtures.chorusView({id: "43894639"});
        this.model = new chorus.models.DatabaseViewConverter({}, {from: this.from});
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/chorus_views/43894639/convert");
    });

    describe("#databaseView", function() {
        beforeEach(function() {
            this.model.set({id: '12345', workspace: {id: 25} })
        });

        it("has a link to the show page", function() {
            expect(this.model.databaseView().showUrl()).toEqual("#/workspaces/25/datasets/12345")
        });
    });
});