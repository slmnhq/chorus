describe("chorus.pages.KaggleUserIndexPage", function() {
    beforeEach(function() {
        this.workspace = rspecFixtures.workspace({name: "kagSpace"});
        this.kaggleUsers = new chorus.collections.KaggleUserSet([], {workspace: this.workspace})
        this.page = new chorus.pages.KaggleUserIndexPage(this.workspace.id);
    });

    describe("setup", function() {
        it("fetches the kaggle users", function() {
            expect(this.kaggleUsers).toHaveBeenFetched();
        });

        it("has a sidebar with the workspace", function() {
            expect(this.page.sidebar).toBeA(chorus.views.KaggleUserSidebar);
            expect(this.page.sidebar.workspace.id).toBe(this.workspace.id);
        });
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
           expect(this.page.$(".content_header .summary")).toContainTranslation("kaggle.summary", {kaggleLink: 'Kaggle'});
        });
    });

    describe("render", function() {
        beforeEach(function() {
            this.page.render();
            this.server.completeFetchFor(this.kaggleUsers);
        });

        it("sets up the content details", function () {
            expect(this.page.mainContent.contentDetails).toBeA(chorus.views.KaggleUserListContentDetails);
            expect(this.page.mainContent.contentDetails.collection).toBeA(chorus.collections.KaggleUserSet);
        });

        it("creates a KaggleUserList view", function() {
            expect(this.page.$(".kaggle_user_list")).toExist();
        });

        it("creates a KaggleUserSidebar view", function() {
            expect(this.page.$(".kaggle_user_sidebar")).toExist();
        });
    });

    describe("on filterKaggleUsers page event", function () {
        beforeEach(function () {
            this.server.reset();
            var filterCollection = new chorus.collections.KaggleFilterSet([
                new chorus.models.KaggleFilter(),
                new chorus.models.KaggleFilter()
            ]);
            spyOn(filterCollection.at(1), 'filterParams').andReturn(null);
            spyOn(filterCollection.at(0), 'filterParams').andReturn("someValue");
            chorus.PageEvents.broadcast("filterKaggleUsers", filterCollection);
        });

        it("send the params as format filter|comparator|value", function () {
            expect(this.page.collection).toHaveBeenFetched();
            var url = this.server.lastFetchFor(this.page.collection).url;
            expect(url).toContainQueryParams({'kaggleUser[]':'someValue'});
        });
    });
});