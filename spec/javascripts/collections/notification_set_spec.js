describe("chorus.collections.NotificationSet", function() {
    beforeEach(function() {
        this.collection = fixtures.notificationSet([
            fixtures.notification({ body: { id: "101", type: "NOTE" } }),
            fixtures.notification({ body: { id: "102", type: "WORKSPACE_CREATED" } }),
            fixtures.notification({ body: { id: "103", type: "MEMBERS_ADDED" } }),
            fixtures.notification({ body: { id: "104", type: "INSTANCE_CREATED" } })
        ]);
    });

    it("is composed of notifications", function() {
        expect(this.collection.model).toBe(chorus.models.Notification);
    })

    it("has the correct urlTemplate", function() {
        expect(this.collection.urlTemplate).toBe("notification");
    });

    describe("#activities", function() {
        beforeEach(function() {
            this.activities = this.collection.activities();
        });

        it("returns an ActivitySet collection", function() {
            expect(this.activities).toBeA(chorus.collections.ActivitySet);
        });

        it("has the 'loaded' property set to true", function() {
            expect(this.activities.loaded).toBeTruthy();
        });

        it("has an activity model for each model in the notification set", function() {
            expect(this.activities.models.length).toBe(4);

            expect(this.activities.models[0].get("id")).toBe("101");
            expect(this.activities.models[1].get("id")).toBe("102");
            expect(this.activities.models[2].get("id")).toBe("103");
            expect(this.activities.models[3].get("id")).toBe("104");

            expect(this.activities.models[0].get("type")).toBe("NOTE");
            expect(this.activities.models[1].get("type")).toBe("WORKSPACE_CREATED");
            expect(this.activities.models[2].get("type")).toBe("MEMBERS_ADDED");
            expect(this.activities.models[3].get("type")).toBe("INSTANCE_CREATED");
        });
    });
});

