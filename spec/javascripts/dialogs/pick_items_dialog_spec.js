describe("chorus.dialogs.PickItems", function() {
    beforeEach(function() {
        stubDefer();

        this.user1 = newFixtures.user({ firstName: "A", lastName: "User" });
        this.user2 = newFixtures.user({ firstName: "B", lastName: "User" });
        this.user3 = newFixtures.user({ firstName: "C", lastName: "User" });

        this.users = new chorus.collections.Base([this.user1, this.user2, this.user3]);
        this.dialog = new chorus.dialogs.PickItems({ workspaceId: "33", collection: this.users });
    });

    describe("render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("uses a loading section", function() {
            expect(this.dialog.$(".loading_section")).toExist();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.users.loaded = true;
                this.dialog.render();
            });

            it("renders a search input", function() {
                expect(this.dialog.$(".search input")).toExist();
            });

            it("defaults to no selection", function() {
                expect(this.dialog.$("li.selected")).not.toExist();
            });

            it("#selectedItem returns undefined when there is no selection", function() {
                expect(this.dialog.selectedItem()).toBeUndefined();
            });

            it("disables the submit button by default", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });

            it("uses the default search placeholder text", function() {
                expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("pickitem.dialog.search.placeholder");
            });

            context("when the search placeholder text is supplied", function() {
                it("uses the supplied text", function() {
                    this.dialog.searchPlaceholderKey = "test.mouse";
                    this.dialog.render();
                    expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("test.mouse");
                });
            });

            it("includes a name for each entry", function() {
                var names = this.dialog.$("li .name");
                expect(names.length).toBe(this.dialog.collection.length);
                expect(names.eq(0)).toContainText(this.user1.name());
                expect(names.eq(0).attr("title")).toContainText(this.user1.name());

                expect(names.eq(1)).toContainText(this.user2.name());
                expect(names.eq(1).attr("title")).toContainText(this.user2.name());
            });

            it("has a close window button that cancels the dialog", function() {
                expect(this.dialog.$("button.cancel")).toExist();
            });

            it("has the 'Attach File' button disabled by default", function() {
                expect(this.dialog.$('button.submit')).toBeDisabled();
            });

            context("when the collection is empty", function() {
                beforeEach(function() {
                    this.dialog.emptyListTranslationKey = "test.mouse";
                    this.dialog.collection.reset();
                    this.dialog.collection.loaded = true;
                    this.dialog.render();
                });

                it("shows the 'none' key translation", function() {
                    expect(this.dialog.$(".none")).toContainTranslation("test.mouse");
                });
            });

            context("default selection", function() {
                beforeEach(function() {
                    this.selected = new chorus.collections.UserSet([this.user1, this.user2]);
                    this.dialog = new chorus.dialogs.PickItems({ workspaceId: "33", collection: this.users, defaultSelection: this.selected });
                    this.dialog.render();
                });

                it("selects the supplied users by default", function() {
                    expect(this.dialog.$("li").length).toBe(3);
                    expect(this.dialog.$("li.selected").length).toBe(2);
                    expect(this.dialog.$("li:eq(0).selected")).toContainText(this.user1.name());
                    expect(this.dialog.$("li:eq(1).selected")).toContainText(this.user2.name());
                });

                it("enables the submit button", function() {
                    expect(this.dialog.$('button.submit')).not.toBeDisabled();
                });
            });

            describe("multiselection", function() {
                beforeEach(function() {
                    this.users = new chorus.collections.UserSet([this.user1, this.user2, this.user3]);
                    this.users.loaded = true;

                    this.dialog = new chorus.dialogs.PickItems({ workspaceId: "33", collection: this.users, multiSelection: true });
                    this.dialog.render();
                    this.dialog.$("li:eq(0)").click();
                    this.dialog.$("li:eq(2)").click();
                });

                it("has selected multiple items", function() {
                    expect(this.dialog.$("li:eq(0)")).toHaveClass("selected");
                    expect(this.dialog.$("li:eq(2)")).toHaveClass("selected");
                });

                it("does not clear the selection when a new item is selected", function() {
                    this.dialog.$("li:eq(0)").click();
                    expect(this.dialog.$("li:eq(2)")).toHaveClass("selected");
                });

                it("de-selects a selected item when clicked again", function() {
                    this.dialog.$("li:eq(0)").click();
                    expect(this.dialog.$("li:eq(0)")).not.toHaveClass("selected");
                });

                it("enables the submit button", function() {
                    expect(this.dialog.$('button.submit')).not.toBeDisabled();
                });
            });

            describe("single selection", function() {
                beforeEach(function() {
                    this.itemSelectedSpy = jasmine.createSpy();
                    this.dialog.bind("item:selected", this.itemSelectedSpy);
                    this.dialog.$("li:first").click();
                });

                it("marks the clicked item as selected", function() {
                    expect(this.dialog.$("li:first")).toHaveClass("selected");
                });

                it("triggers an item:selected event", function() {
                    expect(this.itemSelectedSpy).toHaveBeenCalledWith(this.users.at(0));
                });

                it("returns the selected item", function() {
                    expect(this.dialog.selectedItem()).toBe(this.users.at(0));
                });

                describe("clicking on another list item", function() {
                    beforeEach(function() {
                        this.itemSelectedSpy.reset();
                        this.dialog.$("li:last").click();
                    });

                    it("marks the clicked item as selected", function() {
                        expect(this.dialog.$("li:last")).toHaveClass("selected");
                    });

                    it("unselects previously selected items", function() {
                        expect(this.dialog.$("li:first")).not.toHaveClass("selected");
                    });

                    it("triggers another item:selected event", function() {
                        expect(this.itemSelectedSpy).toHaveBeenCalledWith(this.users.at(2));
                    });

                    it("#selectedItem returns the selected item", function() {
                        expect(this.dialog.selectedItem()).toBe(this.users.at(2));
                    });
                });
            });

            describe("double-clicking", function() {
                it("triggers an item:doubleclick event", function() {
                    spyOnEvent(this.dialog, "item:doubleclick");
                    this.dialog.$("li:eq(1)").dblclick();
                    expect("item:doubleclick").toHaveBeenTriggeredOn(this.dialog, [[this.user2]])
                });
            })
        });
    });

    describe("sorting", function() {
        beforeEach(function() {
            this.users.loaded = true;
        });

        context("when a sort function is provided by the collection", function() {
            beforeEach(function() {
                this.users.comparator = function(model) {
                    return model.displayName().toLowerCase();
                };
                spyOn(this.users, "comparator").andCallThrough();
                this.dialog = new chorus.dialogs.PickItems({ collection: this.users });
            });

            it("uses the comparator to sort the collection", function() {
                expect(this.users.comparator).toHaveBeenCalled();
            });
        });

        context("when a sort function is not provided by the collection", function() {
            beforeEach(function() {
                spyOn(chorus.dialogs.PickItems.prototype, "collectionComparator").andCallThrough();
                this.users.comparator = undefined;
                this.dialog = new chorus.dialogs.PickItems({ collection: this.users });
                this.dialog.render();
            });

            it("falls back to the default sort (name)", function() {
                expect(this.dialog.collectionComparator).toHaveBeenCalled();
            });

            it("sorts the items alphabetically, case-insensitively", function() {
                expect(this.dialog.$("li").length).toBe(3);
                expect(this.dialog.$("li .name").eq(0)).toContainText("A User");
                expect(this.dialog.$("li .name").eq(1)).toContainText("B User");
                expect(this.dialog.$("li .name").eq(2)).toContainText("C User");
            });
        });
    });

    describe("search", function() {
        beforeEach(function() {
            this.users = new chorus.collections.UserSet([
                newFixtures.user({firstName: "xyz", lastName: "3 ab"}),
                newFixtures.user({firstName: "EFG", lastName: "1"}),
                newFixtures.user({firstName: "hij", lastName: "2 a"})
            ]);
            this.users.loaded = true;
            this.dialog = new chorus.dialogs.PickItems({ collection: this.users });
            this.dialog.render();
        })

        describe("typing the first character", function() {
            beforeEach(function() {
                this.dialog.$("input").val("A");
                this.dialog.$(".search input").trigger("textchange");
            })

            it("hides items not containing that character", function() {
                expect(this.dialog.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                expect(this.dialog.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                expect(this.dialog.$("li .name[title='hij 2 a']").parent("li")).not.toHaveClass("hidden");
            })

            describe("typing another character", function() {
                beforeEach(function() {
                    this.dialog.$("input").val("ab");
                    this.dialog.$(".search input").trigger("textchange");
                })

                it("hides items not containing the adjacent character sequence", function() {
                    expect(this.dialog.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                    expect(this.dialog.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                    expect(this.dialog.$("li .name[title='hij 2 a']").parent("li")).toHaveClass("hidden");
                })

                describe("backspacing", function() {
                    beforeEach(function() {
                        this.dialog.$("input").val("a");
                        this.dialog.$(".search input").trigger("textchange");
                    })

                    it("hides items not containing that character", function() {
                        expect(this.dialog.$("li .name[title='xyz 3 ab']").parent("li")).not.toHaveClass("hidden");
                        expect(this.dialog.$("li .name[title='EFG 1']").parent("li")).toHaveClass("hidden");
                        expect(this.dialog.$("li .name[title='hij 2 a']").parent("li")).not.toHaveClass("hidden");
                    })
                })
            })
        })

        describe("with a selection", function() {
            beforeEach(function() {
                this.dialog.$("li:eq(2)").click();
            })

            describe("when the filter text matches the selected item", function() {
                beforeEach(function() {
                    this.dialog.$("input").val("a");
                    this.dialog.$(".search input").trigger("textchange");
                })

                it("retains the selection", function() {
                    expect(this.dialog.$("li:eq(2)")).toHaveClass("selected");
                })
            })

            describe("when the filter text does not match the selected item", function() {
                beforeEach(function() {
                    this.dialog.$("input").val("m");
                    this.dialog.$(".search input").trigger("textchange");
                })

                it("clears the selection", function() {
                    expect(this.dialog.$("li.selected")).not.toExist();
                })
            })
        })
    })

    describe("submit", function() {
        beforeEach(function() {
            this.users.loaded = true;
            this.dialog.render();
            this.dialog.$("li:eq(0)").click();
        });

        it("dismisses the dialog", function() {
            spyOn(this.dialog, "closeModal");
            this.dialog.$("button.submit").click();
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("triggers the selection event with the selected items", function() {
            this.dialog.selectedEvent = "some:event";
            spyOnEvent(this.dialog, this.dialog.selectedEvent);
            this.dialog.$("button.submit").click();
            expect(this.dialog.selectedEvent).toHaveBeenTriggeredOn(this.dialog, [
                [this.user1]
            ]);
        });
    });
});