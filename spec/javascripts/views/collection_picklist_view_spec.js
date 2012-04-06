describe("chorus.views.CollectionPicklist", function() {
    beforeEach(function() {
        stubDefer();

        this.user1 = newFixtures.user({firstName: "xyz", lastName: "3 ab"});
        this.user2 = newFixtures.user({firstName: "EFG", lastName: "1"});
        this.user3 = newFixtures.user({firstName: "hij", lastName: "2 a"});

        this.collection = new chorus.collections.UserSet([this.user1, this.user2, this.user3]);
        this.view = new chorus.views.CollectionPicklist({ collection: this.collection })
    });

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

        context("when the collection is empty", function() {
            beforeEach(function() {
                this.view.emptyListTranslationKey = "test.mouse";
                this.view.collection.reset();
                this.view.collection.loaded = true;
                this.view.render();
            });

            it("shows the 'none' key translation", function() {
                expect(this.view.$(".none")).toContainTranslation("test.mouse");
            });
        });

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

            it("uses the supplied text for the search input placeholder", function() {
                this.view.searchPlaceholderKey = "test.mouse";
                this.view.render();
                expect(this.view.$("input").attr("placeholder")).toMatchTranslation("test.mouse");
            });

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

            context("selecting items by default", function() {
                beforeEach(function() {
                    this.defaultUsers = new chorus.collections.UserSet([this.user1, this.user2]);
                    this.view = new chorus.views.CollectionPicklist({ collection: this.collection, defaultSelection: this.defaultUsers });
                    this.view.render();
                });

                it("selects the supplied users by default", function() {
                    expect(this.view.$("li").length).toBe(3);
                    expect(this.view.$("li.selected").length).toBe(2);
                });
            });

            describe("multiselection", function() {
                beforeEach(function() {
                    this.defaultUsers = new chorus.collections.UserSet([this.user1, this.user2]);
                    this.view = new chorus.views.CollectionPicklist({ collection: this.collection, multiSelection: true });
                    this.view.render();

                    this.view.$("li:eq(0)").click();
                    this.view.$("li:eq(2)").click();
                });

                it("has selected multiple items", function() {
                    expect(this.view.$("li:eq(0)")).toHaveClass("selected");
                    expect(this.view.$("li:eq(2)")).toHaveClass("selected");
                });

                it("does not clear the selection when a new item is selected", function() {
                    this.view.$("li:eq(0)").click();
                    expect(this.view.$("li:eq(2)")).toHaveClass("selected");
                });

                it("de-selects a selected item when clicked again", function() {
                    this.view.$("li:eq(0)").click();
                    expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
                });
            });
        })
    })

    describe("sorting", function() {
        beforeEach(function() {
            this.collection.loaded = true;
        });

        context("when a sort function is provided by the collection", function() {
            beforeEach(function() {
                this.collection.comparator = function(model) {
                    return model.displayName().toLowerCase();
                };
                spyOn(this.collection, "comparator").andCallThrough();
                this.view = new chorus.views.CollectionPicklist({ collection: this.collection });
            });

            it("uses the comparator to sort the collection", function() {
                expect(this.collection.comparator).toHaveBeenCalled();
            });
        });

        context("when a sort function is not provided by the collection", function() {
            beforeEach(function() {
                spyOn(chorus.views.CollectionPicklist.prototype, "collectionComparator").andCallThrough();
                this.collection.comparator = undefined;
                this.view = new chorus.views.CollectionPicklist({ collection: this.collection });
                this.view.collectionModelContext = function(model) {
                    return {
                        name: model.displayName(),
                        imageUrl: model.picklistImageUrl()
                    }
                };

                this.view.render();
            });

            it("falls back to the default sort (name)", function() {
                expect(this.view.collectionComparator).toHaveBeenCalled();
            });

            it("sorts the items alphabetically, case-insensitively", function() {
                expect(this.view.$("li").length).toBe(3);
                expect(this.view.$("li .name").eq(0)).toContainText("EFG 1");
                expect(this.view.$("li .name").eq(1)).toContainText("hij 2 a");
                expect(this.view.$("li .name").eq(2)).toContainText("xyz 3 ab");
            });
        });
    });

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

            describe("clicking on another list item", function() {
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

        describe("clicking an item in multiselection mode", function() {
            beforeEach(function() {
                this.itemSelectedSpy = jasmine.createSpy("item:selected");
                this.view.bind("item:selected", this.itemSelectedSpy);

                this.view.multiSelection = true;
                this.view.$("li:eq(0)").click();
            });

            it("triggers item:selected with the item", function() {
                expect(this.itemSelectedSpy).toHaveBeenCalledWith([this.collection.at(0)]);
            });

            describe("clicking a second item", function() {
                beforeEach(function() {
                    this.view.$("li:eq(1)").click();
                });

                it("triggers item:selected with both items", function() {
                    expect(this.itemSelectedSpy.calls[1].args[0].length).toBe(2);
                    expect(this.itemSelectedSpy).toHaveBeenCalledWith([this.collection.at(0), this.collection.at(1)]);
                });
            });
        });
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
                expect(this.view.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                expect(this.view.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                expect(this.view.$("li .name[title='hij 2 a']").parent("li")).not.toHaveClass("hidden");
            })

            describe("typing another character", function() {
                beforeEach(function() {
                    this.itemSelectedSpy = jasmine.createSpy();
                    this.view.bind("item:selected", this.itemSelectedSpy);
                    this.view.$("input").val("ab");
                    this.view.$(".search input").trigger("textchange");
                })

                it("hides items not containing the adjacent character sequence", function() {
                    expect(this.view.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                    expect(this.view.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                    expect(this.view.$("li .name[title='hij 2 a']").parent("li")).toHaveClass("hidden");
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
                        expect(this.view.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                        expect(this.view.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                        expect(this.view.$("li .name[title='hij 2 a']").parent("li")).not.toHaveClass("hidden");
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
                    this.view.$("input").val("a");
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
