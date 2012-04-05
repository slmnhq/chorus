describe("chorus.views.CollectionPicklist", function() {
    beforeEach(function() {
        this.collection = fixtures.userSet([
            newFixtures.user({firstName: "xyz", lastName: "3 ab"}),
            newFixtures.user({firstName: "EFG", lastName: "1"}),
            newFixtures.user({firstName: "hij", lastName: "2 a"})
        ]);
        this.view = new chorus.views.CollectionPicklist({ collection : this.collection })
    })

    describe("#render", function() {
        context("when the collection is not loaded", function() {
            beforeEach(function() {
                this.collection.loaded = undefined;
                this.view.render();
            })

            it("displays a loading message", function() {
                expect(this.view.$(".loading")).toExist();
            })
        })

        context("when the collection is loaded", function() {
            beforeEach(function() {
                this.collection.loaded = true;
                this.view.render();
            })

            it("renders a search input", function() {
                expect(this.view.$(".search input")).toExist();
            })

            it("renders a list of collection items", function() {
                expect(this.view.$(".items li").length).toBe(this.collection.length);
            })

            it("uses the displayName for each collection item", function() {
                var items = this.view.$(".items li .name");
                expect(items).toExist();
                _.each(items, function(item, index) {
                    expect($(item).text().trim()).toBe(this.collection.at(index).displayName())
                }, this)
            })

            it("sets the title attribute for each collection item", function() {
                var items = this.view.$(".items li .name");
                _.each(items, function(item, index) {
                    expect($(item).attr("title")).toBe(this.collection.at(index).displayName())
                }, this)
            })

            it("displays an image for each collection item", function() {
                var items = this.view.$(".items li img");
                expect(items).toExist();
                _.each(items, function(item, index) {
                    expect($(item).attr("src")).toBe(this.collection.at(index).imageUrl())
                }, this)
            })

            it("sorts the items alphabetically, case-insensitively", function() {
                expect(this.view.$("li .name").eq(0).text().trim()).toBe("EFG 1");
                expect(this.view.$("li .name").eq(1).text().trim()).toBe("hij 2 a");
                expect(this.view.$("li .name").eq(2).text().trim()).toBe("xyz 3 ab");
            })
        })
    })

    describe("#collectionModelContext", function() {
        it("includes the displayName as 'name'", function() {
            expect(this.view.collectionModelContext(this.collection.at(0)).name).toBe(this.collection.at(0).displayName());
        })
    })

    describe("#selectedItem", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.view.render();
        })

        it("defaults to no selection", function() {
            expect(this.view.$("li.selected")).not.toExist();
        })

        it("returns undefined", function() {
            expect(this.view.selectedItem()).toBeUndefined();
        })


        describe("clicking on a list item", function() {
            beforeEach(function() {
                this.itemSelectedSpy = jasmine.createSpy();
                this.view.bind("item:selected", this.itemSelectedSpy);
                this.view.$("li:first").click();
            })

            it("marks the clicked item as selected", function() {
                expect(this.view.$("li:first")).toHaveClass("selected");
            })

            it("triggers an item:selected event", function() {
                expect(this.itemSelectedSpy).toHaveBeenCalledWith(this.collection.at(0));
            })

            it("returns the selected item", function() {
                expect(this.view.selectedItem()).toBe(this.collection.at(0));
            })

            describe("clicking on another list item", function () {
                beforeEach(function() {
                    this.itemSelectedSpy.reset();
                    this.view.$("li:last").click();
                })

                it("marks the clicked item as selected", function() {
                    expect(this.view.$("li:last")).toHaveClass("selected");
                })

                it("unselects previously selected items", function() {
                    expect(this.view.$("li:first")).not.toHaveClass("selected");
                })

                it("triggers another item:selected event", function() {
                    expect(this.itemSelectedSpy).toHaveBeenCalledWith(this.collection.at(2));
                })

                it("returns the selected item", function() {
                    expect(this.view.selectedItem()).toBe(this.collection.at(2));
                })
            })
        })
    })

    describe("search", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.view.render();
        })

        describe("typing the first character", function() {
            beforeEach(function() {
                this.view.$("input").val("a");
                this.view.$(".search input").trigger("textchange");
            })

            it("hides items not containing that character", function() {
                expect(this.view.$("li:eq(0)")).toHaveClass("hidden");
                expect(this.view.$("li:eq(1)")).not.toHaveClass("hidden");
                expect(this.view.$("li:eq(2)")).not.toHaveClass("hidden");
            })

            describe("typing another character", function() {
                beforeEach(function() {
                    this.itemSelectedSpy = jasmine.createSpy();
                    this.view.bind("item:selected", this.itemSelectedSpy);
                    this.view.$("input").val("ab");
                    this.view.$(".search input").trigger("textchange");
                })

                it("hides items not containing the adjacent character sequence", function() {
                    expect(this.view.$("li:eq(0)")).toHaveClass("hidden");
                    expect(this.view.$("li:eq(1)")).toHaveClass("hidden");
                    expect(this.view.$("li:eq(2)")).not.toHaveClass("hidden");
                })

                it("triggers item:selected with undefined", function() {
                    expect(this.itemSelectedSpy).toHaveBeenCalledWith(undefined);
                })

                describe("backspacing", function() {
                    beforeEach(function() {
                        this.view.$("input").val("a");
                        this.view.$(".search input").trigger("textchange");
                    })

                    it("hides items not containing that character", function() {
                        expect(this.view.$("li:eq(0)")).toHaveClass("hidden");
                        expect(this.view.$("li:eq(1)")).not.toHaveClass("hidden");
                        expect(this.view.$("li:eq(2)")).not.toHaveClass("hidden");
                    })
                })
            })
        })

        describe("with a selection", function() {
            beforeEach(function() {
                this.view.$("li:first").addClass("selected");
            })

            describe("when the filter text matches the selected item", function() {
                beforeEach(function() {
                    this.view.$("input").val("E");
                    this.view.$(".search input").trigger("textchange");
                })

                it("retains the selection", function() {
                    expect(this.view.$("li:first")).toHaveClass("selected");
                })
            })

            describe("when the filter text does not match the selected item", function() {
                beforeEach(function() {
                    this.view.$("input").val("m");
                    this.view.$(".search input").trigger("textchange");
                })

                it("clears the selection", function() {
                    expect(this.view.$("li.selected")).not.toExist();
                })
            })
        })
    })
})
