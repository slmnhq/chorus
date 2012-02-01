describe("chorus.collections.NotificationSet", function() {
    beforeEach(function() {
        this.collection = fixtures.notificationSet();
    });

    it("is composed of alerts", function() {
        expect(this.collection.model).toBe(chorus.models.Notification);
    })

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("alert");
    });
});

