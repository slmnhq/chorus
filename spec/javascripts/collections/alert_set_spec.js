describe("chorus.collections.AlertSet", function() {
    beforeEach(function() {
        this.collection = fixtures.alertSet();
    });

    it("is composed of alerts", function() {
        expect(this.collection.model).toBe(chorus.models.Alert);
    })

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("alert");
    });
});

