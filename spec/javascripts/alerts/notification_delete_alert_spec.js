describe("chorus.alerts.NotificationDeleteAlert", function() {
    beforeEach(function() {
        this.activity = fixtures.activities.NOTE_ON_WORKSPACE();
        this.activity.set({notificationId: 1234});
        this.launchElement = $("<a/>");
        this.launchElement.data("activity", this.activity);
        this.alert = new chorus.alerts.NotificationDeleteAlert({launchElement: this.launchElement});
    });

    it("makes a notification model", function() {
        expect(this.alert.model.get("id")).toBe(1234);
        expect(this.alert.model).toBeA(chorus.models.Notification);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render();
        });

        it("should have a submit button with the text 'Delete Notification'", function() {
            expect(this.alert.$("button.submit")).toContainTranslation("notification.delete.ok");
        });

        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("notification.delete.title");
        });

        it("should have the correct alert text", function() {
            expect(this.alert.text).toMatchTranslation("notification.delete.text");
        });

        context("clicking the delete button", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast");
                spyOn(chorus, "toast");
                this.alert.$("button.submit").click();
            });

            it("should delete the notification", function() {
                expect(this.server.lastDestroy().url).toHaveUrlPath(this.alert.model.url());
            });

            context("when the delete completes", function() {
                beforeEach(function() {
                    this.server.lastDestroy().succeed();
                });

                it("should broadcast a notification:deleted event", function() {
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("notification:deleted");
                });

                it("should display a toast", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("notification.delete.success", undefined);
                });
            });
        });
    });
});