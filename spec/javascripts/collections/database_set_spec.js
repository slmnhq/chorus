describe("chorus.collections.DatabaseSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseSet([], {instanceId: 86});
    });

    it("has the right show url", function() {
        expect(this.collection.showUrl()).toMatchUrl("#/instances/86/databases");
    });
});

