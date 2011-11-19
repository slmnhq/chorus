describe("WorkspaceIndexContentHeader", function() {
    beforeEach(function() {
        this.loadTemplate("workspace_index_content_header");
        this.view = new chorus.views.WorkspaceIndexContentHeader();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("contains the title", function() {
            expect(this.view.$("h1").text()).toContain("Workspaces");
        });

        it("contains a filter menu", function() {
            expect(this.view.$(".menu.popup_filter")).toExist();
        });

        describe("clicking on the filter link", function(){
            beforeEach(function(){
                this.view.$(".link.filter a").click();
            });

            it("shows the popup menu", function(){
                expect(this.view.$(".menu")).not.toHaveClass("hidden");
            });

            describe("clicking on the link again", function() {
                it("closes the popup menu", function() {
                    this.view.$(".link.filter a").click();
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                });
            });

            describe("clicking on the 'all workspaces' link", function() {
                beforeEach(function(){
                    this.filterSpy = jasmine.createSpy("filter:all");
                    this.view.bind("workspaces:filter:all", this.filterSpy);

                    this.view.$(".menu a[data-type=all]").click();
                });

                it("triggers the workspaces:filter:all", function() {
                    expect(this.filterSpy).toHaveBeenCalled();
                });

                it("dismisses the popup", function(){
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                });

                it("Sets the text of the filter link", function(){
                    expect(this.view.$(".link.filter a span").text()).toBe(t("filter.all_workspaces"));
                });
            });

            describe("clicking on the 'active workspaces' link", function() {
                beforeEach(function(){
                    this.filterSpy = jasmine.createSpy("filter:active");
                    this.view.bind("workspaces:filter:active", this.filterSpy);

                    this.view.$(".menu a[data-type=active]").click();
                });

                it("triggers the workspaces:filter:active", function() {
                    expect(this.filterSpy).toHaveBeenCalled();
                });

                it("dismisses the popup", function(){
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                });

                it("Sets the text of the filter link", function(){
                    expect(this.view.$(".link.filter a span").text()).toBe(t("filter.active_workspaces"));
                });
            });
        });
    });
});
