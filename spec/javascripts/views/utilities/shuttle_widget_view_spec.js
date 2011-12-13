describe("chorus.views.ShuttleWidget", function() {
    beforeEach(function() {
        this.loadTemplate("shuttle_widget")
        fixtures.model = "UserSet";
        this.collection = fixtures.modelFor("fetch");
        this.selectedItems = new Backbone.Collection([this.collection.get("10001")]);
        this.view = new chorus.views.ShuttleWidget({ collection : this.collection, selectionSource : this.selectedItems });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an li for each item in the available collection", function() {
            expect(this.view.$("ul.available li").length).toBe(this.collection.length);
        });

        it("renders an li for each item in the selected list", function() {
            expect(this.view.$("ul.selected li.added").length).toBe(this.selectedItems.length);
        });

        it("adds the added class to each available item that is in the selected ID list", function() {
            expect(this.view.$("ul.available li.added").length).toBe(this.selectedItems.length);
        });

        it("renders the model image in an li", function() {
           expect(this.view.$("ul.available li:eq(0) .profile").attr("src")).toBe(this.collection.get("10000").imageUrl());
           expect(this.view.$("ul.selected li.added:eq(0) .profile").attr("src")).toBe(this.collection.get("10001").imageUrl());
        });

        it("renders the model displayName in an li", function() {
            expect(this.view.$("ul.available li:eq(0) .name").text().trim()).toBe(this.collection.get("10000").displayName());
            expect(this.view.$("ul.selected li.added:eq(0) .name").text().trim()).toBe(this.collection.get("10001").displayName());
        });

        it("also puts the displayName in the title", function() {
            expect(this.view.$("ul.available li:eq(0) .name").attr('title')).toBe(this.collection.get("10000").displayName());
            expect(this.view.$("ul.selected li.added:eq(0) .name").attr('title')).toBe(this.collection.get("10001").displayName());
        });

        it("returns the original list of selected IDs", function() {
            var selected = this.view.getSelectedIDs();
            expect(selected.length).toBe(1);
            expect(selected[0]).toBe("10001");
        });

        it("does not add the filtered_out class to anything when first rendered", function() {
            expect(this.view.$("ul.available li.filtered_out").length).toBe(0);
        });

        describe("clicking the add link", function() {
            beforeEach(function() {
                this.view.$("li[data-id='10002'] a.add").click();
            });

            it("adds the 'added' class to the containing li", function() {
                expect(this.view.$("ul.available li[data-id='10002']")).toHaveClass("added");
            });

            it("adds the 'added' class to the corresponding li in the selected ul", function() {
                expect(this.view.$("ul.selected li[data-id='10002']")).toHaveClass("added");
            });

            it("returns the new list of selected IDs", function() {
                var selected = this.view.getSelectedIDs();
                expect(selected.length).toBe(2);
                expect(selected[0]).toBe("10001");
                expect(selected[1]).toBe("10002");
            });
        });

        describe("clicking the remove link", function() {
            beforeEach(function() {
                this.view.$("li[data-id='10001'] a.remove").click();
            });

            it("removes the 'added' class from the li in the 'selected' ul", function() {
                expect(this.view.$("ul.selected li[data-id='10001']")).not.toHaveClass("added");
            });

            it("removes the 'added' class from the corresponding li in the 'available' ul", function() {
                expect(this.view.$("ul.available li[data-id='10001']")).not.toHaveClass("added");
            });

            it("returns the new list of selected IDs", function() {
                var selected = this.view.getSelectedIDs();
                expect(selected.length).toBe(0);
            });
        });

        describe("clicking the Add all link", function() {
            beforeEach(function() {
                this.view.$('a.add_all').click();
            });

            it("adds all the members", function() {
                expect(this.view.$('ul.selected li.added').length).toBe(3);
                expect(this.view.$('ul.available li.added').length).toBe(3);
            });
        });

        describe("clicking the remove all link", function() {
            beforeEach(function() {
                this.view.$('a.remove_all').click();
            });

            it("removes all the members", function() {
                expect(this.view.$('ul.selected li.added').length).toBe(0);
                expect(this.view.$('ul.available li.added').length).toBe(0);
            });
        });

        describe("search", function() {
            context("when typing something that matches one name", function() {
                beforeEach(function() {
                    this.view.$(".search input").val("admin");
                    this.view.$(".search input").trigger("textchange");
                });

                it("should add the filtered_out class to the non-matching items", function() {
                    expect(this.view.$("ul.available li:eq(0)")).toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(2)")).toHaveClass("filtered_out");
                });

                it("should not add the filtered_out class to the matching item", function() {
                    expect(this.view.$("ul.available li:eq(1)")).not.toHaveClass("filtered_out");
                });
            });

            context("when typing something that matches more than one name", function() {
                beforeEach(function() {
                    this.view.$(".search input").val("ma");
                    this.view.$(".search input").trigger("textchange");
                });

                it("should add the filtered_out class to the non-matching item", function() {
                    expect(this.view.$("ul.available li:eq(1)")).toHaveClass("filtered_out");
                });

                it("should not add the filtered_out class to the matching items", function() {
                    expect(this.view.$("ul.available li:eq(0)")).not.toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(2)")).not.toHaveClass("filtered_out");
                });
            });

            context("when typing something that matches nothing", function() {
                beforeEach(function() {
                    this.view.$(".search input").val("xx");
                    this.view.$(".search input").trigger("textchange");
                });

                it("should add the filtered_out class to the non-matching item", function() {
                    expect(this.view.$("ul.available li:eq(0)")).toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(1)")).toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(2)")).toHaveClass("filtered_out");
                });
            });

            context("when the search bar is empty", function() {
                beforeEach(function() {
                    this.view.$(".search input").val("");
                    this.view.$(".search input").trigger("textchange");
                });

                it("should not add the filtered_out class to anything", function() {
                    expect(this.view.$("ul.available li:eq(0)")).not.toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(1)")).not.toHaveClass("filtered_out");
                    expect(this.view.$("ul.available li:eq(2)")).not.toHaveClass("filtered_out");
                });
            });
        });
    });
});