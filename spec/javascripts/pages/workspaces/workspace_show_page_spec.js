describe("chorus.pages.WorkspaceShowPage", function() {
    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("workspace_summary")
        })
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        })

        context("while the model is loading", function(){
            beforeEach(function(){
                this.page.model.loaded = false;
                this.page.render();
            });

            it("does not display any text", function(){
                expect(this.page.$(".breadcrumb").text().trim()).toBe("");
            });
        });

        context("when the model has loaded", function(){
            beforeEach(function(){
                this.server.completeFetchFor(this.page.model, fixtures.workspace({summary: "this is a summary", name : "Cool Workspace"}))
                this.page.render();
            });

            it("uses a TruncatedText view for the header", function() {
                expect(this.page.mainContent.contentHeader instanceof chorus.views.TruncatedText).toBeTruthy();
            });

            it("uses the workspace's summary for the text of the header", function() {
                expect(this.page.mainContent.contentHeader.$(".text_content").text()).toBe(this.page.model.get("summary"));
            });

            it("displays the breadcrumbs", function(){
                expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
                expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));

                expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
                expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe(t("breadcrumbs.workspaces"));

                expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("Cool Workspace");
            });

            context("when the model changes", function(){
                beforeEach(function(){
                    this.page.model.set({name: "bar"})
                });

                it("displays the new breadcrumb automatically", function(){
                    expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("bar");
                });
            });
        });
    })
});
