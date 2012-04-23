describe("chorus.views.SubNav", function() {
    beforeEach(function() {
        this.model = newFixtures.workspace();
        this.view = new chorus.views.SubNav({ tab : "workfiles", model : this.model });
    })

    describe("#render", function() {
        beforeEach(function() {
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
