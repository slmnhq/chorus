describe("chorus.views.WorkspaceShow", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
        this.model = new chorus.models.Workspace({ id : 4 });
        this.model.fetch();
        this.view = new chorus.views.WorkspaceShow({ model : this.model });
        this.view.render();
    });

    describe("#render", function() {
        context("before the model is fetched", function() {
            it("shows a loading message", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        });

        it("fetches the workspace's activities", function() {
            expect(this.model.activities()).toHaveBeenFetched();
        });

        describe("after the model and its activities are fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.model);
                this.server.completeFetchFor(this.model.activities());
            });

            describe("the header", function() {
                beforeEach(function() {
                    this.header = this.view.activityListHeader;
                });

                it("has an ActivityListHeader with the right collection", function() {
                    expect(this.header).toBeA(chorus.views.ActivityListHeader);
                    expect(this.header.el).toBe(this.view.$(".activity_list_header")[0]);

                    expect(this.header.collection).toBe(this.model.activities());
                });

                it("has the workspace", function() {
                    expect(this.header.options.workspace).toBe(this.model);
                })

                describe("when the fetch for the number of insights completes", function() {
                    beforeEach(function() {
                        this.server.lastFetch().succeed();
                    });

                    it("displays the right title", function() {
                        expect(this.view.$("h1").text()).toMatchTranslation("workspace.activity");
                    });

                    describe("when the 'insights' link is clicked", function() {
                        beforeEach(function() {
                            this.view.$("a.insights").trigger("click");
                        });

                        it("displays the right title for insights", function() {
                            expect(this.view.$("h1").text()).toMatchTranslation("workspace.insights");
                        });
                    });
                });
            });

            it("renders the activity list", function() {
                expect(this.view.$(".activity_list").length).toBe(1);
            });
        });
    })
})
