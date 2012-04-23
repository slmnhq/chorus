describe("chorus.pages.WorkspaceIndexPage", function() {
    beforeEach(function() {
        this.workspaces = newFixtures.workspaceSet();
        this.page = new chorus.pages.WorkspaceIndexPage();
    });

    describe("#initialize", function() {
        it("has a helpId", function() {
            expect(this.page.helpId).toBe("workspaces")
        })

        it("has a sidebar", function() {
            expect(this.page.sidebar).toBeA(chorus.views.WorkspaceListSidebar);
        });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        });

        describe("when the collection is loading", function() {
            it("should have a loading element", function() {
                expect(this.page.$(".loading")).toExist();
            });

            it("has a header", function() {
                expect(this.page.$("h1")).toExist();
            })
        });

        describe("when the collection is loaded", function() {
            beforeEach(function() {
                chorus.bindModalLaunchingClicks(this.page);
                this.server.completeFetchFor(this.page.collection)
            });

            it("creates a WorkspaceList view", function() {
                expect(this.page.$(".workspace_list")).toExist();
            });

            it("displays an 'add workspace' button", function() {
                expect(this.page.$("button:contains('Create Workspace')")).toExist();
            });

            describe("when the workspace:selected event is triggered on the list view", function() {
                beforeEach(function() {
                    expect(this.page.model).toBeUndefined();
                    chorus.PageEvents.broadcast("workspace:selected", this.page.collection.at(0));
                });

                it("sets the model of the page", function() {
                    expect(this.page.model).toBe(this.page.collection.at(0));
                })
            });
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
