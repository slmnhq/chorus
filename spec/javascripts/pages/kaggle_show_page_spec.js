describe("chorus.pages.KaggleShowPage", function() {
   beforeEach(function() {
       this.workspace = rspecFixtures.workspace({name: "kagSpace"});
       this.page = new chorus.pages.KaggleShowPage(this.workspace.id);
   });

    context("while the workspace is loading", function() {
        beforeEach(function() {
            this.page.render();
        });

        it("displays some breadcrumbs", function() {
            expect(this.page.$(".breadcrumb")).toContainTranslation("breadcrumbs.home")
        });
    });

    context("after the workspace has loaded successfully", function() {
       beforeEach(function() {
          this.server.completeFetchFor(this.workspace, this.workspace);
       });

        it("displays the breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe(t("breadcrumbs.workspaces"));

            expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe(this.workspace.showUrl());
            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("kagSpace");

            expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toBe("Kaggle");
        });

        it("shows the kaggle header", function() {
           expect(this.page.$(".content_header .summary")).toContainTranslation("kaggle.summary")
        });
    });
});