describe("chorus.views.SearchResultList", function() {
    beforeEach(function() {
        this.model = fixtures.searchResult();
        this.view = new chorus.views.SearchResultList({model: this.model});
        this.view.render();
    });

    it("should include search results for a workfile", function() {
        expect(this.view.$(".search_workfile_list")).toExist();
    });

    it("should include the search results for tabular data", function() {
        expect(this.view.$(".search_tabular_data_list")).toExist();
    });

    describe("clicking an li", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, 'broadcast');
        });

        context("when the li is for a workfile", function() {
            it("triggers the 'workfile:selected' event on itself, with the clicked workfile", function() {
                var workfileToClick = this.model.workfiles().at(1);
                this.view.$(".workfile_list li").eq(1).click();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:selected", workfileToClick);
            });
        });

        context("when the li is for a workspace", function() {
            it("broadcasts the 'workspace:selected' page event, with the clicked workspace", function() {
                var workspaceToClick = this.model.workspaces().at(1);
                this.view.$(".workspace_list li").eq(1).click();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workspace:selected", workspaceToClick);
            });
        });

        context("when the li is for a tabular data", function() {
            it("broadcasts the 'tabularData:selected' page event, with the clicked tabular data", function() {
                var modelToClick = this.model.tabularData().at(0);
                this.view.$(".tabular_data_list li").eq(0).click();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("tabularData:selected", modelToClick);
            });
        });
    });
});
