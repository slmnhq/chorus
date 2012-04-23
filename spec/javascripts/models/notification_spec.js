describe("chorus.models.Notification", function() {
    beforeEach(function() {
        this.notification = fixtures.notifications.BE_MEMBER({
            author: {
                id: "10000",
                firstName: "Colonel",
                lastName: "Sanders"
            }
        });
    });

    describe("initialization", function() {
        it("has the correct url template", function() {
            expect(this.notification.urlTemplate).toBe("notification/{{id}}");
        });
    });

    describe("#activity", function() {
        beforeEach(function() {
            this.activity = this.notification.activity();
        });

        it("returns an Activity model", function() {
            expect(this.activity).toBeA(chorus.models.Activity);
        });

        it("should memoize the activity", function() {
            expect(this.activity).toBe(this.notification.activity());
        });

        it("has the right type", function() {
            expect(this.activity.get("type")).toBe("BE_MEMBER");
        });

        it("has the right author data", function() {
            expect(this.activity.get("author").id).toBe("10000");
            expect(this.activity.get("author").firstName).toBe("Colonel");
            expect(this.activity.get("author").lastName).toBe("Sanders");
        });
    });
})
