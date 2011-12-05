describe("WorkfileListView", function() {
    beforeEach(function() {
        this.loadTemplate("workfile_list");
    });
    describe("#render", function() {
        context("with no workfiles in the collection", function() {
            beforeEach(function() {
                this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
            });

            it("doesn't render any items", function() {
                expect(this.view.$("li").length).toBe(0);
            });
        });

        context("with some workfiles in the collection", function() {
            beforeEach(function() {
                this.model1 = new chorus.models.Workfile({id: 12, fileType: "sql", fileName: "some_file.sql", description: "describe 1", workspaceId: 1});
                this.model2 = new chorus.models.Workfile({id: 34, fileType: "txt", fileName: "other_file.txt", description: "describe 2", workspaceId: 1});
                this.collection = new chorus.models.WorkfileSet([this.model1, this.model2], {workspaceId: 1234});
                this.view = new chorus.views.WorkfileList({collection: this.collection});
                this.view.render();
            });

            it("renders an li for each item in the collection", function() {
                expect(this.view.$("li").length).toBe(2);
            });

            it("links each workfile to its show page", function() {
                expect($(this.view.$("a.name")[0]).attr("href")).toBe(this.model1.showUrl());
                expect($(this.view.$("a.name")[1]).attr("href")).toBe(this.model2.showUrl());
            });

            it("includes data-id for each item", function() {
                expect($(this.view.$("li")[0]).data("id")).toBe(this.model1.get("id"));
                expect($(this.view.$("li")[1]).data("id")).toBe(this.model2.get("id"));
            });

            it("includes the filename as a link", function() {
                expect($(this.view.$("li a.name")[0]).text().trim()).toBe(this.model1.get("fileName"));
                expect($(this.view.$("li a.name")[1]).text().trim()).toBe(this.model2.get("fileName"));
            });

            it("includes the correct workspace file icon", function() {
                expect($(this.view.$("li img")[0]).attr("src")).toBe("/images/workfileIcons/sql.png");
                expect($(this.view.$("li img")[1]).attr("src")).toBe("/images/workfileIcons/text.png");
            });

            it("includes the description", function() {
                expect($(this.view.$("li .summary")[0]).text().trim()).toBe(this.model1.get("description"));
                expect($(this.view.$("li .summary")[1]).text().trim()).toBe(this.model2.get("description"));
            });

            context("clicking on the first item", function() {
                beforeEach(function() {
                    this.eventSpy = jasmine.createSpy();
                    this.view.bind("workfile:selected", this.eventSpy);
                    this.li1 = this.view.$("li")[0];
                    $(this.li1).click();
                });

                it("adds the selected class to that item", function() {
                    expect($(this.li1)).toHaveClass("selected");
                });

                it("triggers the workfile:selected event", function() {
                    expect(this.eventSpy).toHaveBeenCalledWith(this.model1);
                });

                context("and then clicking on the second item", function() {
                    beforeEach(function() {
                        this.li2 = this.view.$("li")[1];
                        $(this.li2).click();
                    });
                    it("removes the selected class from the first li", function() {
                        expect($(this.li1)).not.toHaveClass("selected");
                    });

                    it("adds the selected class to the second li", function() {
                        expect($(this.li2)).toHaveClass("selected");
                    });

                    it("triggers the workfile:selected event", function() {
                        expect(this.eventSpy).toHaveBeenCalledWith(this.model2);
                    });
                });
            });
        });
    });

    describe("#filter", function() {
        beforeEach(function() {
            this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
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
