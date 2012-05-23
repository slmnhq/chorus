    describe("chorus.collections.DatabaseSet", function() {
    beforeEach(function() {
        this.instanceId = '86'
        this.collection = new chorus.collections.DatabaseSet([], {instanceId: this.instanceId});
    });

    it("has the right show url", function() {
        expect(this.collection.showUrl()).toMatchUrl("#/instances/86/databases");
    });

    describe("reset", function() {
        it("sets the instanceId on all the new models", function() {
            var database = fixtures.database();
            this.collection.reset(database);
            expect(database.get("instanceId")).toBe(this.instanceId);
        });
    });
});

