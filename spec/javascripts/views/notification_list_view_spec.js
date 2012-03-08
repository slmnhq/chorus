describe("chorus.views.NotificationList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.NotificationSet([
            fixtures.notification({ unread: true }),
            fixtures.notification(),
            fixtures.notification()
        ]);
        this.view = new chorus.views.NotificationList({ collection: this.collection });
    });

    describe("#render", function() {
        beforeEach(function() {
            spyOn(chorus.views.Activity.prototype, 'initialize').andCallThrough();
            this.view.render();
        });

        it("renders an li for each notification in the collection", function() {
            expect(this.view.$("li").length).toBe(3);
        });

        it("highlights the unread notifications", function() {
            expect(this.view.$("li:eq(0)")).toHaveClass("unread");
            expect(this.view.$("li:eq(1)")).not.toHaveClass("unread");
            expect(this.view.$("li:eq(2)")).not.toHaveClass("unread");
        });

        it("passes the 'isNotification' option to the activity views", function() {
            var viewOptions = chorus.views.Activity.prototype.initialize.mostRecentCall.args[0];
            expect(viewOptions.isNotification).toBeTruthy();
        });
    });
});
