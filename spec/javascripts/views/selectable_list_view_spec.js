describe("chorus.views.SelectableList", function() {
    beforeEach(function() {
        spyOn(chorus.PageEvents, "broadcast").andCallThrough();
        this.collection = new chorus.collections.UserSet([rspecFixtures.user(), rspecFixtures.user()]);
        this.view = new chorus.views.SelectableList({
            collection: this.collection
        });
        // normally would be set by subclass
        this.view.eventName = "user";
        this.view.templateName = "user/list";
        this.view.render();
    });

    it("is a ul with class list", function() {
        expect($(this.view.el).is("ul.list")).toBeTruthy();
    });

    it("preselects the first item", function() {
        expect(this.view.$("> li").eq(0)).toHaveClass("selected");
        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("user:selected", this.collection.at(0));
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
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("user:selected", this.collection.at(1));
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
    });

    describe("selecting an item that does not exist", function() {
        beforeEach(function() {
            this.view.$("li").addClass("hidden");
            this.view.selectItem(this.view.$("li:not(:hidden)").eq(0));
        });

        it("broadcasts an item deselected event", function() {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("user:deselected");
        });
    });

    describe("when eventName:search is triggered", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.DatabaseSet([fixtures.database({name: "1" }), fixtures.database({name: "2"})]);
            this.collection.loaded = true;
            this.view = new chorus.views.DatabaseList({collection: this.collection});
            $("#jasmine_content").append(this.view.el);
            this.view.render();

            this.view.$("> li:eq(0)").removeClass("selected").addClass("hidden");
            chorus.PageEvents.broadcast("database:search");
        });

        it("should select the first visible item in the list", function() {
            expect(this.view.$("li").eq(1)).toHaveClass("selected");
        })
    })
})
