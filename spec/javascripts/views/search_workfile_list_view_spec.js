describe("chorus.views.SearchWorkfileList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SearchWorkfileList({
            workfileResults: {docs:[
                {id: "1", workspaceId: "2"},
                {id: "4", workspaceId: "3"}
            ],
            numFound: "24"
            }
        });

        this.view.render()
    });

    it("shows each model in the collection", function() {
        expect(this.view.$('li').length).toBe(2);
    });

    it("has a link for each model in the collection", function() {
        expect(this.view.$('li a').eq(0).attr('href')).toBe("#/workspaces/2/workfiles/1");
        expect(this.view.$('li a').eq(1).attr('href')).toBe("#/workspaces/3/workfiles/4");
    });

    describe("details bar", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("workfiles.title");
        });

        it("has a count", function() {
            expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
        });

        it("has a showAll link", function() {
            expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
        })
    })
});