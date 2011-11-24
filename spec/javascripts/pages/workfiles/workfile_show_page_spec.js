describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        this.loadTemplate("sub_nav_content");
        this.loadTemplate("sub_nav_and_header");
        this.loadTemplate("breadcrumbs");

        this.workspaceId = 4;
        this.workfileId = 5;
        this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
    });

    describe("#setup", function() {
        it("instantiates and fetches a workspace with  given id", function() {
            var workspace = this.page.workspace;
            expect(workspace.get("id")).toBe(this.workspaceId);
            expect(this.server.requests[0].url).toBe(workspace.url());
        });

        it("instantiates and fetches a workfile with ehe given id", function() {
            var workfile = this.page.model;
            expect(workfile.get("workfileId")).toBe(this.workfileId);
            expect(this.server.requests[1].url).toBe(workfile.url());
        });
    });

    describe("#render", function(){
        beforeEach(function() {
            this.page.model.set({
                name: "A file"
            });
            this.page.render();
        });

        xit("it displays the workfile name in the content header", function() {
            var workfile = this.page.model;
            expect(this.page.mainContent.header.$("h1").text()).toBe("A file");
        });

        // describe("breadcrumbs", function() {
        //     it("links to  ", function() {
                
        //     });
        // });
    })
});
