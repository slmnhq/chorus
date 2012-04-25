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
                expect(this.collection.url()).toHaveUrlPath("/notification")
            });
        });

        context("when constructed with a type option", function() {
            beforeEach(function() {
                this.collection = fixtures.notificationSet([], { type: "unread" })
            });

            it("is correct", function() {
                expect(this.collection.url()).toMatchUrl("/notification?type=unread", { paramsToIgnore: ["page", "rows" ]})
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

    describe("when adding models", function() {
        context("when the notification set has the type 'unread'", function() {
            beforeEach(function() {
                this.collection.attributes.type = "unread";
            });

            it("sets 'unread' to true on each model", function() {
                var model = fixtures.notification();
                this.collection.add(model);
                expect(model.get("unread")).toBeTruthy();
            });
        });

        context("when the notification set does not have the type 'unread'", function() {
            it("does not set the 'unread' attribute on the model", function() {
                var model = fixtures.notification();
                this.collection.add(model);
                expect(model.get("unread")).toBeUndefined();
            });
        });
    });

    describe("#markAllRead with no unread notifications", function() {
        beforeEach(function() {
            this.server.reset();
            this.collection.reset();
            this.successSpy = jasmine.createSpy();
            this.collection.markAllRead({ success: this.successSpy });
        });

        it("does not make any requests", function() {
            expect(this.server.requests.length).toBe(0);
        })

        it("calls the success function", function() {
            expect(this.successSpy).toHaveBeenCalled();
        })
    })

    describe("#markAllRead with unread notifications", function() {
        beforeEach(function() {
            this.successSpy = jasmine.createSpy();
            this.collection.markAllRead({ success: this.successSpy });
        });

        it("calls the correct API", function() {
            expect(this.server.lastUpdate().url).toBe("/notification/101,102,103,104/read")
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

