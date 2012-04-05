describe("chorus.views.ShuttleWidget", function() {
    beforeEach(function() {
        this.collection = fixtures.userSet([
            newFixtures.user({id: 10000, firstName: "a", lastName: "a", admin: false}),
            newFixtures.user({id: 10001, firstName: "b", lastName: "b", admin: true}),
            newFixtures.user({id: 10002, firstName: "a", lastName: "c", admin: false})
        ]);
        this.selectedItems = new Backbone.Collection([this.collection.get("10001")]);
        this.nonRemovableItems = [this.collection.get("10000")];
        this.nonRemovableText = "RockSteady"
        this.view = new chorus.views.ShuttleWidget(
            { collection : this.collection,
              selectionSource : this.selectedItems,
              nonRemovable: this.nonRemovableItems,
              nonRemovableText: this.nonRemovableText
            });
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

        it("renders an li for each nonRemovable item", function() {
            expect(this.view.$("ul.selected li.non_removable").length).toBe(this.nonRemovableItems.length);
        });

        it("adds the added class to each available item that is in the selected ID list", function() {
            expect(this.view.$("ul.available li.added").length).toBe(this.selectedItems.length);
        });

        it("adds the non_removable class to the appropriate available items", function() {
            expect(this.view.$("ul.available li.non_removable").length).toBe(this.nonRemovableItems.length);
        })

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

        it("does not add the hidden class to anything when first rendered", function() {
            expect(this.view.$("ul.available li.hidden").length).toBe(0);
        });

        it("does not have a remove link for non-removable items", function() {
            expect(this.view.$("ul.selected li.non_removable a").length).toBe(0);
        });

        it("renders the non-removable text in the appropriate place", function() {
            expect(this.view.$("ul.selected li.non_removable span").text()).toBe(this.nonRemovableText);
            expect(this.view.$("ul.available li.non_removable span").text()).toBe(this.nonRemovableText);
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

            it("does not remove the owner", function() {
               expect(this.view.$('ul.selected li.non_removable.added').length).toBe(1)
               expect(this.view.$('ul.available li.non_removable.added').length).toBe(1)
            });

            it("removes all the other members", function() {
                expect(this.view.$('ul.selected li.added').length).toBe(1);
                expect(this.view.$('ul.available li.added').length).toBe(1);
            });
        });

        describe("search", function() {
            context("when typing something that matches one name", function() {
                beforeEach(function() {
                    this.view.$("input.search").val("b");
                    this.view.$("input.search").trigger("textchange");
                });

                it("should add the hidden class to the non-matching items", function() {
                    expect(this.view.$("ul.available li:eq(0)")).toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(2)")).toHaveClass("hidden");
                });

                it("should not add the hidden class to the matching item", function() {
                    expect(this.view.$("ul.available li:eq(1)")).not.toHaveClass("hidden");
                });
            });

            context("when typing something that matches more than one name", function() {
                beforeEach(function() {
                    this.view.$("input.search").val("a");
                    this.view.$("input.search").trigger("textchange");
                });

                it("should add the hidden class to the non-matching item", function() {
                    expect(this.view.$("ul.available li:eq(1)")).toHaveClass("hidden");
                });

                it("should not add the hidden class to the matching items", function() {
                    expect(this.view.$("ul.available li:eq(0)")).not.toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(2)")).not.toHaveClass("hidden");
                });
            });

            context("when typing something that matches nothing", function() {
                beforeEach(function() {
                    this.view.$("input.search").val("xx");
                    this.view.$("input.search").trigger("textchange");
                });

                it("should add the hidden class to the non-matching item", function() {
                    expect(this.view.$("ul.available li:eq(0)")).toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(1)")).toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(2)")).toHaveClass("hidden");
                });
            });

            context("when the search bar is empty", function() {
                beforeEach(function() {
                    this.view.$("input.search").val("");
                    this.view.$("input.search").trigger("textchange");
                });

                it("should not add the hidden class to anything", function() {
                    expect(this.view.$("ul.available li:eq(0)")).not.toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(1)")).not.toHaveClass("hidden");
                    expect(this.view.$("ul.available li:eq(2)")).not.toHaveClass("hidden");
                });
            });
        });
    });
});
