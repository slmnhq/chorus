describe("chorus.views.BreadcrumbView", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.BreadcrumbsView({ breadcrumbs : [
                {label : "Home", url : "#/"},
                {label : "Foo", url : "#/foo"},
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

        it("sets title attributes", function() {
            expect(this.view.$(".breadcrumb:eq(0) a").attr("title")).toBe("Home");
            expect(this.view.$(".breadcrumb:eq(1) a").attr("title")).toBe("Foo");
            expect(this.view.$(".breadcrumb:eq(2) span").attr("title")).toBe("Bar");
        })
    })
});

describe("chorus.views.WorkspaceBreadcrumbView", function() {
    describe("#render", function(){
        context("while the model is loading", function(){
            beforeEach(function(){
                this.model = new chorus.models.Base();
                this.model.loaded = false;
                this.view = new chorus.views.WorkspaceBreadcrumbsView({model: this.model});
                this.view.render();
            });

            it("does not display any text", function(){
                expect(this.view.$(".breadcrumb").text().trim()).toBe("");
            });
        });

        context("when the model has loaded", function(){
            beforeEach(function(){
                this.model = new chorus.models.Base();
                this.model.loaded = true;
                this.model.set({name: "foo"});
                this.view = new chorus.views.WorkspaceBreadcrumbsView({model: this.model});
                this.view.render();
            });

            it("displays the breadcrumbs", function(){
                expect(this.view.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
                expect(this.view.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));
                expect(this.view.$(".breadcrumb:eq(1)").text().trim()).toBe("foo");
            });

            context("when the model changes", function(){
                beforeEach(function(){
                    this.model.set({name: "bar"})
                });

                it("displays the new breadcrumb automatically", function(){
                    expect(this.view.$(".breadcrumb:eq(1)").text().trim()).toBe("bar");
                });
            });
        });
    });
});
