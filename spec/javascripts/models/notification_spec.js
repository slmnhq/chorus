describe("chorus.models.Notification", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.notificationSet();
        this.notification = this.collection.at(0);
    });

    describe("initialization", function() {
        it("has the correct url template", function() {
            expect(this.notification.urlTemplate).toBe("notification/{{id}}");
        });
    });

    describe("#activity", function() {
        beforeEach(function() {
            this.oldId = this.notification.attributes.event.id;
            this.activity = this.notification.activity();
        });

        it("returns an Activity model", function() {
            expect(this.activity).toBeA(chorus.models.Activity);
        });

        it("should memoize the activity", function() {
            expect(this.activity).toBe(this.notification.activity());
        });

        it("has the right type", function() {
            expect(this.activity.get("action")).toBe("NOTE");
        });

        it("has the right author data", function() {
            expect(this.activity.get("actor").id).toBe(this.notification.get("actor").id);
            expect(this.activity.get("actor").firstName).toBe(this.notification.get("actor").firstName);
            expect(this.activity.get("actor").lastName).toBe(this.notification.get("actor").lastName);
        });

        it("has the id of its activity, so it fetches the correct error details", function() {
            expect(this.activity.id).toBe(this.oldId);
        });

        it("has the right timestamp", function() {
            expect(this.activity.get("timestamp")).toBe(this.notification.get("timestamp"));
            expect(this.notification.get("event").timestamp).not.toBe(this.activity.get("timestamp"));
        });

        context("when there is a comment", function() {
            beforeEach(function(){
                this.notification = this.collection.find(function(notification) {
                    return notification.get("comment");
                });
                this.activity = this.notification.activity();
            });

            it("has the right body", function() {
                expect(this.notification.get("comment").text).toBeDefined();
                expect(this.activity.get("body")).toBe(this.notification.get("comment").text);
            });

            it("has the right author data", function() {
                expect(this.activity.get("actor").firstName).toBe(this.notification.get("actor").firstName);
                expect(this.activity.get("actor").lastName).toBe(this.notification.get("actor").lastName);
            });
        });

        context("when there is not a comment", function() {
            it("has the right body", function() {
                expect(this.activity.get("body")).toBe(this.notification.get("event").body);
            });
        });
    });
});
