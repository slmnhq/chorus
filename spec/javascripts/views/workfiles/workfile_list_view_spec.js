describe("chorus.views.WorkfileList", function() {
    beforeEach(function() {
        spyOn(chorus.PageEvents, "broadcast");
    });

    context("with no workfiles in the collection", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileSet([], {workspaceId : 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection});
            this.view.render();
        });

        it("does not trigger workfile:selected", function() {
            expect(chorus.PageEvents.broadcast).not.toHaveBeenCalled();
        });
    });

    context("with some workfiles in the collection", function() {
        beforeEach(function() {
            this.model1 = fixtures.sqlWorkfile();
            this.model1.get('recentComments').length = 1;
            this.model1.set({commentCount: 1});
            this.model2 = fixtures.textWorkfile();
            this.model3 = fixtures.otherWorkfile();
            this.model3.set({recentComments: [], commentCount: 0});
            this.collection = new chorus.collections.WorkfileSet([this.model1, this.model2, this.model3], {workspaceId: 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection, activeWorkspace: true});
            this.view.render();
        });

        context("when the workspace is archived", function() {
            beforeEach(function() {
                this.view.options.activeWorkspace = false;
                this.view.render();
            });

            it("should not have links to the workfile", function() {
                expect(this.view.$('a.image')).not.toExist();
                expect(this.view.$('a.name')).not.toExist();
            });
        });

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li").length).toBe(3);
        });

        it("pre-selects the first item in the list", function() {
            expect(this.view.$("li:first-child")).toHaveClass("selected");
        });

        it("should broadcast a workfile:selected event when itemSelected is called", function() {
            this.view.itemSelected(this.model1);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:selected", this.model1);
        });
    });

    describe("#filter", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileSet([], {workspaceId : 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection});
            spyOn(this.view.collection, "fetch");
            this.view.filter("sql");
        })

        it("should set the filter attribute", function() {
            expect(this.view.collection.attributes.type).toBe("sql")
        })

        it("should call fetch", function() {
            expect(this.view.collection.fetch).toHaveBeenCalled();
        })
    })
});
