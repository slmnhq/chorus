describe("chorus.dialogs.PickItems", function() {
    beforeEach(function() {
        stubDefer();
        spyOn(chorus.dialogs.PickItems.prototype, "selectItem").andCallThrough();
        spyOn(chorus.dialogs.PickItems.prototype, "submit").andCallThrough();
        spyOn(chorus.dialogs.PickItems.prototype, "selectionFinished").andCallThrough();

        this.user1 = newFixtures.user({ firstName: "A", lastName: "User" });
        this.user2 = newFixtures.user({ firstName: "B", lastName: "User" });
        this.user3 = newFixtures.user({ firstName: "C", lastName: "User" });

        this.users = new chorus.collections.UserSet([this.user1, this.user2, this.user3]);
        var Subclass = chorus.dialogs.PickItems.extend({ modelClass: "User" });
        this.dialog = new Subclass({ workspaceId: "33", collection: this.users });
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

            it("defaults to no selection", function() {
                expect(this.dialog.$("li.selected")).not.toExist();
            });

            it("#selectedItem returns undefined when there is no selection", function() {
                expect(this.dialog.selectedItem()).toBeUndefined();
            });

            it("disables the submit button by default", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
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

            context("when pagination is enabled", function() {
                beforeEach(function() {
                    var subclass = chorus.dialogs.PickItems.extend({
                        modelClass: "User",
                        pagination: true
                    });
                    this.dialog = new subclass({ workspaceId: "33", collection: this.users });
                    this.dialog.render();
                });

                it("renders a pagination bar", function() {
                    expect(this.dialog.$(".pagination.list_content_details")).toExist();
                    expect(this.dialog.pickItemsList.paginationView).toBeA(chorus.views.ListContentDetails);
                    expect(this.dialog.pickItemsList.paginationView.collection).toBe(this.users);
                });

                it("passes the 'modelClass' to the pagination view", function() {
                    expect(this.dialog.pickItemsList.paginationView.options.modelClass).toBe("User");
                });
            });

            context("when pagination is disabled", function() {
                beforeEach(function() {
                    var subclass = chorus.dialogs.PickItems.extend({
                        pagination: false
                    });
                    this.dialog = new subclass({ workspaceId: "33", collection: this.users });
                    this.dialog.render();
                });

                it("doesn't render a pagination bar", function() {
                    expect(this.dialog.$(".pagination")).not.toExist();
                });
            });

            context("when the collection is empty", function() {
                beforeEach(function() {
                    this.dialog.pickItemsList.options.emptyListTranslationKey = "test.mouse";
                    this.dialog.collection.reset();
                    this.dialog.collection.loaded = true;
                    this.dialog.render();
                });

                it("shows the 'none' key translation", function() {
                    expect(this.dialog.$(".none")).toContainTranslation("test.mouse");
                });
            });

            context("default selection", function() {
                context("when a collection is selected", function() {
                    beforeEach(function() {
                        this.selected = new chorus.collections.UserSet([this.user1, this.user2]);
                        this.dialog = new chorus.dialogs.PickItems({
                            workspaceId: "33",
                            collection: this.users,
                            defaultSelection: this.selected
                        });
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
                context("when a single model is selected", function() {
                    beforeEach(function() {
                        this.selected = this.user2;
                        this.dialog = new chorus.dialogs.PickItems({
                            workspaceId: "33",
                            collection: this.users,
                            defaultSelection: this.selected
                        });
                        this.dialog.render();
                    });
                    it("selects the supplied users by default", function() {
                        expect(this.dialog.$("li").length).toBe(3);
                        expect(this.dialog.$("li.selected").length).toBe(1);
                        expect(this.dialog.$("li.selected").eq(0)).toContainText(this.user2.name());
                    });

                    it("enables the submit button", function() {
                        expect(this.dialog.$('button.submit')).not.toBeDisabled();
                    });
                });
            });

            describe("multiselection", function() {
                beforeEach(function() {
                    this.users = new chorus.collections.UserSet([this.user1, this.user2, this.user3]);
                    this.users.loaded = true;

                    var subclass = chorus.dialogs.PickItems.extend({
                        multiSelection: true
                    });
                    this.dialog = new subclass({ workspaceId: "33", collection: this.users });
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
                beforeEach(function() {
                    this.dialog.$("li:eq(1)").dblclick();
                });

                it("calls selectItem", function() {
                    expect(this.dialog.selectItem).toHaveBeenCalled();
                });

                it("calls submit", function() {
                    expect(this.dialog.submit).toHaveBeenCalled();
                });

                it("calls #selectionFinished", function() {
                    expect(this.dialog.selectionFinished).toHaveBeenCalled();
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
        var dataset1, dataset2, dataset3;

        beforeEach(function() {
            dataset1 = newFixtures.dataset.sandboxTable();
            dataset2 = newFixtures.dataset.sandboxTable();
            dataset3 = newFixtures.dataset.sandboxTable();

            this.datasets = new chorus.collections.DatasetSet([
                dataset1,
                dataset2,
                dataset3
            ], {workspaceId: '1'});
            this.datasets.loaded = true;
            var Subclass = chorus.dialogs.PickItems.extend({ modelClass: "Dataset" });
            this.dialog = new Subclass({ collection: this.datasets });
            this.dialog.render();

            this.dialog.$("li:eq(2)").click();
        });

        it("uses the default search placeholder text", function() {
            expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("pickitem.dialog.search.placeholder");
        });

        context("when the search placeholder text is supplied", function() {
            it("uses the supplied text", function() {
                var Subclass = chorus.dialogs.PickItems.extend({ searchPlaceholderKey: "test.mouse" });
                this.dialog = new Subclass({ collection: this.datasets });
                this.dialog.render();
                expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("test.mouse");
            });
        });

        describe("client side", function() {
            describe("when the filter text matches the selected item", function() {
                it("retains the selection", function() {
                    this.dialog.$("input").val("e").trigger("textchange");
                    expect(this.dialog.$("li:eq(2)")).toHaveClass("selected");
                });
            });

            describe("when the filter text does not match the selected item", function() {
                beforeEach(function() {
                    this.dialog.$("input").val("z").trigger("textchange");
                });

                it("clears the selection", function() {
                    expect(this.dialog.$("li.selected")).not.toExist();
                });

                it("should disable the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeDisabled();
                });
            });
        });

        describe("server side", function() {
            beforeEach(function() {
                var Subclass = chorus.dialogs.PickItems.extend({ modelClass: "Dataset", serverSideSearch: true });
                this.dialog = new Subclass({ collection: this.datasets });
                this.dialog.render();

                this.dialog.$("li:eq(2)").click();
            });

            it("renders a search input", function() {
                expect(this.dialog.$(".sub_header input")).toExist();
            });

            describe("entering a seach term", function() {
                beforeEach(function() {
                    this.dialog.$(".sub_header input").val("a query").trigger("textchange");
                });

                it("fetches filtered database objects", function() {
                    expect(this.server.lastFetch().url).toMatchUrl(
                        "/edc/workspace/1/dataset?namePattern=a+query",
                        { paramsToIgnore: ["page", "rows"] }
                    );
                });

                context("after the results come back", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.datasets, [ dataset1 ]);
                    });

                    it("updates the list items", function() {
                        expect(this.dialog.$(".name").length).toBe(1);
                    });

                    it("keeps the search term around", function() {
                        expect(this.dialog.$(".sub_header input").val()).toBe("a query")
                    });

                    it("disables the submit button", function() {
                        expect(this.dialog.$("button.submit")).toBeDisabled();
                    });
                });
            });
        });
    });

    describe("#selectionFinished", function() {
        beforeEach(function() {
            this.users.loaded = true;
            this.dialog.render();
            this.dialog.$("li:eq(0)").click();
        });

        it("dismisses the dialog", function() {
            spyOn(this.dialog, "closeModal");
            this.dialog.selectionFinished();
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("triggers the selection event with the selected items", function() {
            this.dialog.selectedEvent = "some:event";
            spyOnEvent(this.dialog, this.dialog.selectedEvent);
            this.dialog.selectionFinished();
            expect(this.dialog.selectedEvent).toHaveBeenTriggeredOn(this.dialog, [
                [this.user1]
            ]);
        });
    });
});
