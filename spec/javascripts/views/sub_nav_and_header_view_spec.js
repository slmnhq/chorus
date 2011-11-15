describe("chorus.views.SubNavAndHeader", function() {
    beforeEach(function() {
        this.loadTemplate("sub_nav_and_header");
        fixtures.model = "Workspace";
        this.model = fixtures.modelFor("fetch");
        this.view = new chorus.views.SubNavHeader({ tab : "workfiles", model : this.model });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("renders the subnav tabs", function() {
            expect(this.view.$(".nav li").length).toBe(3);
        })

        it("renders the subnav header", function() {
            expect(this.view.$(".subnav_header")).toExist();
        })

        it("selects the correct tab", function() {
            expect(this.view.$(".nav li.workfiles")).toHaveClass("selected");
        })

        it("fills in the header title", function() {
            expect(this.view.$(".subnav_header h1").text()).toBe(this.view.$("li.selected").text());
        })
    })
})