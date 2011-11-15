describe("WorkfileListView", function(){
    beforeEach(function(){
        this.loadTemplate("workfile_list");
    });
    describe("#render", function(){
        context("with no workfiles in the collection", function(){
            beforeEach(function(){
                this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
            });

            it("doesn't render any items", function(){
                expect(this.view.$("li").length).toBe(0);
            });
        });

        context("with some workfiles in the collection", function(){
            beforeEach(function(){
                this.model1 = new chorus.models.Workfile({workfileId: 12, fileType: "sql", fileName: "some_file.sql", description: "describe 1"});
                this.model2 = new chorus.models.Workfile({workfileId: 34, fileType: "txt", fileName: "other_file.txt", description: "describe 2"});
                this.collection = new chorus.models.WorkfileSet([this.model1, this.model2], {workspaceId: 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
            });

            it("renders an li for each item in the collection", function(){
                expect(this.view.$("li").length).toBe(2);
            });

            it("includes data-workfileId for each item", function(){
                expect($(this.view.$("li")[0]).data("workfileid")).toBe(this.model1.get("workfileId"));
                expect($(this.view.$("li")[1]).data("workfileid")).toBe(this.model2.get("workfileId"));
            });

            it("includes the filename as a link", function(){
                expect($(this.view.$("li a")[0]).text()).toBe(this.model1.get("fileName"));
                expect($(this.view.$("li a")[1]).text()).toBe(this.model2.get("fileName"));
            });

            it("includes the correct workspace file icon", function(){
                expect($(this.view.$("li img")[0]).attr("src")).toBe("/images/workfileIcons/sql.png");
                expect($(this.view.$("li img")[1]).attr("src")).toBe("/images/workfileIcons/text.png");
            });

            it("includes the description", function(){
                expect($(this.view.$("li p")[0]).text()).toBe(this.model1.get("description"));
                expect($(this.view.$("li p")[1]).text()).toBe(this.model2.get("description"));
            });
        });
    });
});