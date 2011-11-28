describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        this.loadTemplate("main_content");
        this.loadTemplate("sub_nav");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("workfile_header");
        this.loadTemplate("workfile_content_details");

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
            expect(workfile.get("id")).toBe(this.workfileId);
            expect(this.server.requests[1].url).toBe(workfile.url());
        });
    });

    describe("#render", function(){
        beforeEach(function() {
            this.page.model.set({
                fileName: "Afile.txt"
            });
            this.page.render();
        });

        it("it displays the workfile name in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toBe("Afile.txt");
        });

        it("displays the file icon in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl('txt'));
        });

        it("it displays the workfile name in the content detail", function() {
            expect(this.page.mainContent.contentDetails.$("h1").text()).toBe("Afile.txt");
        });

        // describe("breadcrumbs", function() {
        //     it("links to  ", function() {
                
        //     });
        // });
    })
});
