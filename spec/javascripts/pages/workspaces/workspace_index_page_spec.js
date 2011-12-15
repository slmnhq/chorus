describe("chorus.pages.WorkspaceIndexPage", function() {
    beforeEach(function() {
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        }); 
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceIndexPage();
            this.page.render();
        })

        describe("when the collection is loading", function(){
            it("should have a loading element", function(){
                expect(this.page.$(".loading")).toExist();
            });

            it("has a header", function() {
                expect(this.page.$("h1")).toExist();
            })
        });

        it("creates a WorkspaceList view", function() {
            expect(this.page.$(".workspace_list")).toExist();
        });

        it("displays an 'add workspace' button", function() {
            expect(this.page.$("button:contains('Create a Workspace')")).toExist();
        });
    });

    describe("events", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceIndexPage();
            this.page.render();
            this.listView = this.page.mainContent.content;
            this.headerView = this.page.mainContent.contentHeader;
            spyOn(this.page.collection, 'fetch');
        });

        describe("when the 'choice:filter' event is triggered on the content header with 'all'", function() {
            it("fetches the unfiltered collection", function() {
                this.headerView.trigger("choice:filter", "all");
                expect(this.page.collection.attributes.active).toBeFalsy();
                expect(this.page.collection.fetch).toHaveBeenCalled();
            });
        });

        describe("when the 'choice:filter' event is triggered on the content header with 'active'", function() {
            it("fetches only the active collection", function() {
                this.headerView.trigger("choice:filter", "active");
                expect(this.page.collection.attributes.active).toBeTruthy();
                expect(this.page.collection.fetch).toHaveBeenCalled();
            });
        });
    });
});
