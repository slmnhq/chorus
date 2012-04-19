describe("chorus.views.SelectableList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.UserSet([newFixtures.user(), newFixtures.user()]);
        this.view = new chorus.views.SelectableList({
            collection: this.collection
        });

        // normally would be set by subclass
        this.view.templateName = "user/list";
        this.view.itemSelected = jasmine.createSpy();
        this.view.render();
    });

    it("is a ul with class list", function() {
        expect($(this.view.el).is("ul.list")).toBeTruthy();
    });

    it("preselects the first item", function() {
        expect(this.view.$("> li").eq(0)).toHaveClass("selected");
        expect(this.view.itemSelected).toHaveBeenCalledWith(this.collection.at(0));
    })

    describe("clicking another entry", function() {
        beforeEach(function() {
            this.view.$("> li").eq(1).click();
        });

        it("selects only that entry", function() {
            expect(this.view.$("> li").eq(0)).not.toHaveClass("selected");
            expect(this.view.$("> li").eq(1)).toHaveClass("selected");
        })

        it("should call itemSelected with the selected model", function() {
            expect(this.view.itemSelected).toHaveBeenCalledWith(this.collection.at(1));
        });

        describe("rerendering", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("keeps the entry selected", function() {
                expect(this.view.$("> li:eq(1)")).toHaveClass("selected");
            });
        });

        describe("changing pages", function() {
            beforeEach(function() {
                this.collection.fetchPage(2);
                this.server.completeFetchFor(this.collection, this.collection.models, {page: 2});
            });

            it("resets the selection to the first item", function() {
                expect(this.view.$("> li:eq(0)")).toHaveClass("selected");
            });
        });
    })
})
