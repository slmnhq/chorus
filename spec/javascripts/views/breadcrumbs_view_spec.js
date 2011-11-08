describe("chorus.views.BreadcrumbView", function() {
    beforeEach(function() {
        this.loadTemplate("breadcrumbs");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.BreadcrumbsView({ breadcrumbs : [
                {label : "Home", url : "/"},
                {label : "Foo", url : "/foo"},
                {label : "Bar"}
            ]});
            this.view.render();
        })

        it("renders the breadcrumbs", function() {
            expect(this.view.$(".breadcrumb").length).toBe(3);
        })

        it("renders a link to all breadcrumbs except the last one", function() {
            expect(this.view.$(".breadcrumb a").length).toBe(2)
        })

        it("renders links to breadcrumbs", function() {
            expect(this.view.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.view.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/foo");
        })
    })
});
