describe("chorus.views.BreadcrumbView", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.dataObject = {foo: "bar"};
            this.view = new chorus.views.BreadcrumbsView({ breadcrumbs : [
                {label : "Home", url : "#/"},
                {label : "Foo", url : "#/foo"},
                {label : "DataDialog", dialog: "SchemaBrowser", data : { obj: this.dataObject }},
                {label : "SimpleDialog", dialog: "SchemaBrowser"},
                {label : "Bar"}
            ]});
            this.view.render();
        })

        it("renders the breadcrumbs", function() {
            expect(this.view.$(".breadcrumb").length).toBe(5);
        })

        it("renders a link to all breadcrumbs except the last one", function() {
            expect(this.view.$(".breadcrumb a").length).toBe(4)
        })

        it("renders a triangle between each breadcrumb", function() {
            expect(this.view.$(".spacer").length).toBe(4);
        });

        it("renders links to breadcrumbs", function() {
            expect(this.view.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.view.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/foo");
        })

        it("sets title attributes", function() {
            expect(this.view.$(".breadcrumb:eq(0) a").attr("title")).toBe("Home");
            expect(this.view.$(".breadcrumb:eq(1) a").attr("title")).toBe("Foo");
            expect(this.view.$(".breadcrumb:eq(2) a").attr("title")).toBe("DataDialog");
            expect(this.view.$(".breadcrumb:eq(3) a").attr("title")).toBe("SimpleDialog");
            expect(this.view.$(".breadcrumb:eq(4) span").attr("title")).toBe("Bar");
        })

        it("sets the data-dialog option and the class 'dialog' if there's a dialog option", function() {
            expect(this.view.$(".breadcrumb:eq(2) a").attr("data-dialog")).toBe("SchemaBrowser")
            expect(this.view.$(".breadcrumb:eq(2) a")).toHaveClass("dialog")
            expect(this.view.$(".breadcrumb:eq(3) a").attr("data-dialog")).toBe("SchemaBrowser")
            expect(this.view.$(".breadcrumb:eq(3) a")).toHaveClass("dialog")
        })

        it("adds any extra specified data objects to the element", function() {
            expect(this.view.$(".breadcrumb:eq(2) a").data("obj")).toBe(this.dataObject);
            expect(this.view.$(".breadcrumb:eq(3) a").data("obj")).toBeUndefined();
        });
    })
});
