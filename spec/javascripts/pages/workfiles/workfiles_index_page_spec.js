describe("chorus.pages.WorkfileIndexPage", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
        this.loadTemplate("workfile_list")
        this.loadTemplate("workfile_list_sidebar")
        this.loadTemplate("sub_nav_content")
        this.loadTemplate("sub_nav_and_header")
    })

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })
    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.render();
        })
        
        it("triggers the event on the sidebar view", function() {
            var listView = this.page.mainContent.content;
            var sidebar = this.page.sidebar;
            var workfileSelectedSpy = jasmine.createSpy("workfile:selected");
            var workfile = fixtures.modelFor("fetch");
            sidebar.bind("workfile:selected", workfileSelectedSpy);
            listView.trigger("workfile:selected", workfile);

            expect(workfileSelectedSpy).toHaveBeenCalledWith(workfile);
        });
    });
});
