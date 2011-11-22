describe("chorus.pages.WorkspaceIndexPage", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("count");
        this.loadTemplate("workspace_list");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("dashboard_sidebar");
        this.loadTemplate("workspace_index_content_header");

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
                var header = this.view.mainContent.contentHeader;
                this.listView = this.view.mainContent.content;
                header.triggerActive();
            });

            it("calls filterActive on the list view", function() {
                spyOn(this.listView, 'filterActive');
                this.view.render();
                expect(this.listView.filterActive).toHaveBeenCalled();
            });
        });

        context("when the header has the 'all' filter", function() {
            beforeEach(function() {
                var header = this.view.mainContent.contentHeader;
                this.listView = this.view.mainContent.content;
                header.triggerAll();
            });

            it("calls filterAll on the list view", function() {
                spyOn(this.listView, 'filterAll');
                this.view.render();
                expect(this.listView.filterAll).toHaveBeenCalled();
            });
        });
    });

    describe("events", function() {
        beforeEach(function() {
            spyOn(chorus.views.WorkspaceList.prototype, 'filterActive');
            spyOn(chorus.views.WorkspaceList.prototype, 'filterAll');
            spyOn(chorus.views.WorkspaceIndexContentHeader.prototype, 'triggerActive').andCallThrough();

            this.view = new chorus.pages.WorkspaceIndexPage();
            this.view.render();
        });

        describe("when the 'filter:all' event is triggered on the content header", function() {
            it("calls #filterAll on its list view", function() {
                var listView = this.view.mainContent.content;
                var header = this.view.mainContent.contentHeader;

                header.trigger("filter:all");

                expect(listView.filterAll).toHaveBeenCalled();
                expect(listView.filterAll.mostRecentCall.object).toBe(listView);
            });
        });

        describe("when the 'filter:active' event is triggered on the content header", function() {
            it("calls #filterActive on its list view", function() {
                var listView = this.view.mainContent.content;
                var header = this.view.mainContent.contentHeader;

                header.trigger("filter:active");

                expect(listView.filterActive).toHaveBeenCalled();
                expect(listView.filterActive.mostRecentCall.object).toBe(listView);
            });
        });
    });
});
