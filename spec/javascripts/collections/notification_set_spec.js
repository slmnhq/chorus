describe("chorus.collections.NotificationSet", function() {
    beforeEach(function() {
        this.collection = fixtures.notificationSet([
            fixtures.notification({ id: "101", type: "NOTE" }),
            fixtures.notification({ id: "102", type: "WORKSPACE_CREATED" }),
            fixtures.notification({ id: "103", type: "MEMBERS_ADDED" }),
            fixtures.notification({ id: "104", type: "INSTANCE_CREATED" })
        ]);
    });

    it("is composed of notifications", function() {
        expect(this.collection.model).toBe(chorus.models.Notification);
    })

    describe("#url", function() {
        context("when constructed with no type option", function() {
            it("is correct", function() {
                expect(this.collection.url()).toHaveUrlPath("/edc/notification")
            });
        });

        context("when constructed with a type option", function() {
            beforeEach(function() {
                this.collection = fixtures.notificationSet([], { type: "unread" })
            });

            it("is correct", function() {
                expect(this.collection.url()).toMatchUrl("/edc/notification?type=unread", { paramsToIgnore: ["page", "rows" ]})
            });
        });
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

    describe("#markAllRead", function() {
        beforeEach(function() {
            this.successSpy = jasmine.createSpy();
            this.collection.markAllRead({ success: this.successSpy });
        });

        it("calls the correct API", function() {
            expect(this.server.lastUpdate().url).toBe("/edc/notification/101,102,103,104/read")
        });

        describe("when the call succeeds", function() {
            beforeEach(function() {
                this.server.lastUpdate().succeed();
            });

            it("calls the success function", function() {
                expect(this.successSpy).toHaveBeenCalled();
            });
        });

        describe("when the call fails", function() {
            beforeEach(function() {
                this.server.lastUpdate().fail();
            });

            it("does not call the success function", function() {
                expect(this.successSpy).not.toHaveBeenCalled();
            });
        });
    });
});

