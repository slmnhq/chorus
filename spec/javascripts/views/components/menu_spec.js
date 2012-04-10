describe("chorus.views.Menu", function() {
    var menuContainer, launchElement, models, menu,
        onSelectSpy, onChangeSpy;

    beforeEach(function() {
        launchElement = $("<a/>");
        menuContainer = stubQtip();

        models = [
            newFixtures.workspace(),
            newFixtures.workspace(),
            newFixtures.workspace(),
        ];

        onSelectSpies = [
            jasmine.createSpy("onSelect1"),
            jasmine.createSpy("onSelect2")
        ];

        onChangeSpy = jasmine.createSpy("onChange");

        menu = new chorus.views.Menu({
            launchElement: launchElement,
            items: [
                { name: "one",   text: "option 1", data: models[0], onSelect: onSelectSpies[0] },
                { name: "two",   text: "option 2", data: models[1], onSelect: onSelectSpies[1] },
                { name: "three", text: "option 3", data: models[2] }
            ],
            onChange: onChangeSpy,
            checkable: true
        });
    });

    describe("when the launch element is clicked", function() {
        beforeEach(function() {
            launchElement.click();
        });

        it("shows the menu", function() {
            expect(menuContainer).toHaveVisibleQtip();
            expect(menuContainer.find(menu.el)).toExist();
        });
    });

    describe("the menu content", function() {
        beforeEach(function() {
            $("#jasmine_content").append(menu.el);
        });

        it("contains a list with an li for each item", function() {
            var lis = menu.$("li");
            expect(lis.length).toBe(3);
            expect(lis.eq(0)).toContainText("option 1");
            expect(lis.eq(1)).toContainText("option 2");
            expect(lis.eq(2)).toContainText("option 3");
        });

        describe("when an item is clicked", function() {
            beforeEach(function() {
                menu.$("li:eq(1) a").click();
            });

            it("calls the item's 'onSelect' handler with the item's data", function() {
                expect(onSelectSpies[1]).toHaveBeenCalledWith(models[1]);
            });

            it("calls the menu's 'onChange' handler with that item's data", function() {
                expect(onChangeSpy).toHaveBeenCalledWith(models[1]);
            });

            it("does not throw an error when the menu has no 'onChange' handler", function() {
                delete menu.options.onChange;

                expect(function() {
                    menu.$("li:eq(2) a").click();
                }).not.toThrow();
            });
        });

        describe("when an item without a callback is clicked", function() {
            beforeEach(function() {
                menu.$("li:eq(2) a").click();
            });

            it("only calls the menu's 'onChange' handler", function() {
                expect(onChangeSpy).toHaveBeenCalledWith(models[2]);
                expect(onSelectSpies[0]).not.toHaveBeenCalled();
                expect(onSelectSpies[1]).not.toHaveBeenCalled();
            });
        });

        describe("checking a menu item", function() {
            beforeEach(function() {
                menu.options.checkable = true;
                menu.render();
            });

            it("renders a hidden check next to each li", function() {
                expect(menu.$("li .check").length).toBe(3);
                expect(menu.$("li .check")).toBeHidden();
            });

            context("when an item is clicked", function() {
                beforeEach(function() {
                    menu.$("li:eq(1) a").click();
                });

                it("it adds the 'selected' class to the li", function() {
                    expect(menu.$("li:eq(1)")).toHaveClass("selected");
                });

                it("shows the check for that item", function() {
                    expect(menu.$("li:eq(1) .check")).not.toBeHidden();
                });

                context("when a different item is clicked", function() {
                    beforeEach(function() {
                        menu.$("li:eq(2) a").click();
                    });

                    it("it adds the 'selected' class to the new li", function() {
                        expect(menu.$("li:eq(2)")).toHaveClass("selected");
                    });

                    it("removes the 'selected' class from the previous li", function() {
                        expect(menu.$("li:eq(1)")).not.toHaveClass("selected");
                    });
                });
            });
        });

        describe("#disableItem(name)", function() {
            beforeEach(function() {
                menu.disableItem("one");
            });

            it("adds the 'disabled' attribute to that item", function() {
                expect(menu.$("li a:eq(0)")).toHaveAttr("disabled");
                menu.$("li a:eq(0)").click();
                expect(onSelectSpies[0]).not.toHaveBeenCalled();
            });

            describe("#enableItem(name)", function() {
                beforeEach(function() {
                    menu.enableItem("one");
                });

                it("removes the 'disabled' attribute from the item", function() {
                    expect(menu.$("li a:eq(0)")).not.toHaveAttr("disabled");
                    menu.$("li a:eq(0)").click();
                    expect(onSelectSpies[0]).toHaveBeenCalled();
                });
            });
        });
    });
});
