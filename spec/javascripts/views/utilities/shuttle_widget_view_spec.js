describe("chorus.views.ShuttleWidget", function() {
    beforeEach(function() {
        this.loadTemplate("shuttle_widget")
        fixtures.model = "UserSet";
        this.collection = fixtures.modelFor("fetch");
        this.selectedIDs = ["10001"];
        this.view = new chorus.views.ShuttleWidget({ collection : this.collection, selectedIDs : this.selectedIDs });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an li for each item in the available collection", function() {
            expect(this.view.$("ul.available li").length).toBe(this.collection.length);
        });

        it("renders an li for each item in the selected list", function() {
            expect(this.view.$("ul.selected li.added").length).toBe(this.selectedIDs.length);
        });

        it("adds the added class to each available item that is in the selected ID list", function() {
            expect(this.view.$("ul.available li.added").length).toBe(this.selectedIDs.length);
        });

        it("returns the original list of selected IDs", function() {
            var selected = this.view.getSelectedIDs();
            expect(selected.length).toBe(1);
            expect(selected[0]).toBe("10001");
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
    });
});


