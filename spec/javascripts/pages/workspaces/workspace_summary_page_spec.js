describe("chorus.pages.WorkspaceSummaryPage", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
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
            this.page.model.set({summary: "this is a summary", name : "Cool Workspace"});
            this.page.model.loaded = true;
            this.page.render();
        })

        it("uses a TruncatedText view for the header", function() {
            expect(this.page.mainContent.contentHeader instanceof chorus.views.TruncatedText).toBeTruthy();
        });

        it("uses the workspace's summary for the text of the header", function() {
            expect(this.page.mainContent.contentHeader.$(".entire_text").text()).toBe(this.page.model.get("summary"));
        });

        it("renders breadcrumbs as home > {workspace name}", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0) a").text()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe("Cool Workspace");
        });
    })
});
