describe("chorus.pages.GnipInstanceShowPage", function() {
    beforeEach(function() {
        this.model = rspecFixtures.gnipInstance({name: "gnip"});
        this.page = new chorus.pages.GnipInstanceShowPage(this.model.id);
    });

    context("while the instance is loading", function() {
        beforeEach(function() {
            this.page.render();
        });

        it("displays some breadcrumbs", function() {
            expect(this.page.$(".breadcrumb")).toContainTranslation("breadcrumbs.home")
        });
    });

    context("after the instance has loaded successfully", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.model, this.model);
        });

        it("displays the breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe(t("breadcrumbs.instances"));

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("gnip");
        });

        it("has a title bar with an icon", function() {
            expect(this.page.$(".content_header")).toContainText("gnip");
            expect(this.page.$(".content_header img").attr("src")).toContain("/images/instances/gnip.png");
        });

        it("displays the sidebar", function() {
            var sidebar = this.page.sidebar;
            expect(sidebar).toBeDefined();
            expect(sidebar).toBeA(chorus.views.InstanceListSidebar);
            expect(sidebar.model.id).toBe(this.model.id);
            expect(this.page.$('.sidebar_content')).toContainText('Import Stream');
        })

    });
});