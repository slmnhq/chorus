describe("chorus.pages.WorkspaceShowPage", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
    })

    describe(".initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe(4);
        })
    })

    describe(".render", function() {
//        describe("with a loaded Workspace", function() {
//            beforeEach(function() {
////                this.model = fixtures.modelFor("fetch");
//                this.page = new chorus.pages.WorkspaceShowPage(4);
////                this.page.render();
//            })
//
//            it("has the correct tabs", function() {
//                expect(this.view.$("a"))
//            });
//        })
    })
});