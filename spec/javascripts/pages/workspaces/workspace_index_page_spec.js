describe("chorus.pages.WorkspaceIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("list_content_details");
        this.loadTemplate("workspace_list");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("dashboard_sidebar");
        this.loadTemplate("workspace_index_content_header");
        this.loadTemplate("link_menu");

        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        }); 
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.pages.WorkspaceIndexPage();
            this.view.render();
        })

        describe("when the collection is loading", function(){
            it("should have a loading element", function(){
                expect(this.view.$(".loading")).toExist();
            });

            it("has a header", function() {
                expect(this.view.$("h1")).toExist();
            })
        });

        it("creates a WorkspaceList view", function() {
            expect(this.view.$(".workspace_list")).toExist();
        });

        it("displays an 'add workspace' button", function() {
            expect(this.view.$("button:contains('Create a Workspace')")).toExist();
        });

        context("when the header has the 'active' filter", function() {
            beforeEach(function() {
                this.listView = this.view.mainContent.content;
                spyOn(this.listView, 'filterActive');
                this.view.mainContent.contentHeader.$("li[data-type=active] a").click();
            });

            it("calls filterActive on the list view", function() {
                expect(this.listView.filterActive).toHaveBeenCalled();
            });
        });

        context("when the header has the 'all' filter", function() {
            beforeEach(function() {
                this.listView = this.view.mainContent.content;
                spyOn(this.listView, 'filterAll');
                this.view.mainContent.contentHeader.$("li[data-type=all] a").click();
            });

            it("calls filterAll on the list view", function() {
                expect(this.listView.filterAll).toHaveBeenCalled();
            });
        });
    });

    describe("events", function() {
        beforeEach(function() {
            this.view = new chorus.pages.WorkspaceIndexPage();
            this.view.render();
            this.listView = this.view.mainContent.content;
            this.headerView = this.view.mainContent.contentHeader;
            spyOn(this.listView, 'filterActive');
            spyOn(this.listView, 'filterAll');
        });

        describe("when the 'chioce:filter' event is triggered on the content header with 'all'", function() {
            it("calls #filterAll on its list view", function() {
                this.headerView.trigger("choice:filter", "all");
                expect(this.listView.filterAll).toHaveBeenCalled();
                expect(this.listView.filterAll.mostRecentCall.object).toBe(this.listView);
            });
        });

        describe("when the 'chioce:filter' event is triggered on the content header with 'active'", function() {
            it("calls #filterActive on its list view", function() {
                this.headerView.trigger("choice:filter", "active");
                expect(this.listView.filterActive).toHaveBeenCalled();
                expect(this.listView.filterActive.mostRecentCall.object).toBe(this.listView);
            });
        });
    });
});
