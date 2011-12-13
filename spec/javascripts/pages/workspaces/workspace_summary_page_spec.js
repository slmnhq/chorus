describe("chorus.pages.WorkspaceSummaryPage", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
        this.loadTemplate("workspace_detail");
        this.loadTemplate("workspace_summary_sidebar");
        this.loadTemplate("truncated_text");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("header");
        this.loadTemplate("sub_nav");
        this.loadTemplate("sidebar_activity_list");
    })

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceSummaryPage(4);
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceSummaryPage(4);
            this.page.model.set({summary: "this is a summary"});
            this.page.model.loaded = true;
            this.page.render();
        })
        
        it("uses a TruncatedText view for the header", function() {
            expect(this.page.mainContent.contentHeader instanceof chorus.views.TruncatedText).toBeTruthy();
        });

        it("uses the workspace's summary for the text of the header", function() {
            expect(this.page.mainContent.contentHeader.$(".entire_text").text()).toBe(this.page.model.get("summary"));
        });
    })
});
