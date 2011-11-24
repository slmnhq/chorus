describe("chorus.views.SubNav", function() {
    beforeEach(function() {
        this.loadTemplate("sub_nav");
        fixtures.model = "Workspace";
        this.model = fixtures.modelFor("fetch");
        this.view = new chorus.views.SubNav({ tab : "workfiles", model : this.model });
    })

    describe("#render", function() {
        beforeEach(function() {
            console.log(this.view);
            this.view.render();
        })

        it("renders the subnav tabs", function() {
            expect(this.view.$("li").length).toBe(3);
        })

        it("selects the correct tab", function() {
            expect(this.view.$("li.workfiles")).toHaveClass("selected");
        })
    })
})
