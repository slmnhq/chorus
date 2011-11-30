describe("chorus.pages.WorkfileIndexPage", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
        this.loadTemplate("workfile_list")
        this.loadTemplate("workfile_list_sidebar")
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("sub_nav");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("main_content");
        this.loadTemplate("header");
        this.loadTemplate("link_menu");
    })

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })

        it("fetches the first page of the collection", function() {
            expect(this.server.requests[1].url).toBe("/edc/workspace/4/workfile?page=1&rows=50")
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

    describe("menus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.render();
        })

        it("has filters for the types", function() {
            expect(this.page.$("li[data-type=all]")).toExist();
            expect(this.page.$("li[data-type=sql]")).toExist();
        })

        it("has proper file when type chosen" ,function(){
            var collection = this.page.collection;
            spyOn(collection, "fetch");
            this.page.$("li[data-type=sql] a").click();
            expect(collection.attributes.type).toBe("sql");
            expect(collection.fetch).toHaveBeenCalled();
        })
    })
});
