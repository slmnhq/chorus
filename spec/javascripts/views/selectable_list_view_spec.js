describe("chorus.views.SelectableList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.UserSet([fixtures.user(), fixtures.user()]);
        this.view = new chorus.views.SelectableList({
            collection: this.collection
        });

        // normally would be set by subclass
        this.view.className = "user_list";
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
    })
})