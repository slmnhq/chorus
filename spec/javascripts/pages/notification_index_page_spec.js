describe("chorus.pages.NotificationIndexPage", function() {
    beforeEach(function() {
        this.page = new chorus.pages.NotificationIndexPage();
    });

    describe("when the notification fetches completes", function() {
        beforeEach(function() {
            this.collection = fixtures.notificationSet();
            this.server.completeFetchFor(this.collection);
        });

        it("should have the right breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.notifications");

            expect(this.page.$(".breadcrumb").length).toBe(2);
        });

        it("displays the page header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toContainTranslation("header.my_notifications");
        });

        it("has NotificationList as the main content view", function() {
            expect(this.page.mainContent.content).toBeA(chorus.views.NotificationList);
        })
    });
});