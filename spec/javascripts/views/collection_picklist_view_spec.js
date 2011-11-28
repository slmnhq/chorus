describe("chorus.views.CollectionPicklist", function() {
    beforeEach(function() {
        this.loadTemplate("collection_picklist")
        fixtures.model = "UserSet";
        this.collection = fixtures.modelFor("fetch");
        this.view = new chorus.views.CollectionPicklist({ collection : this.collection })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })
        
        context("when the collection is not loaded", function() {
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

            it("displays an image for each collection item", function() {
                var items = this.view.$(".items li img");
                expect(items).toExist();
                _.each(items, function(item, index) {
                    expect($(item).attr("src")).toBe(this.collection.at(index).imageUrl())
                }, this)
            })
        })
    })

    describe("#collectionModelContext", function() {
        it("includes the displayName as 'name'", function() {
            expect(this.view.collectionModelContext(this.collection.at(0)).name).toBe(this.collection.at(0).displayName());
        })
    })

    describe("selection", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.view.render();
        })

        it("defaults to no selection", function() {
            expect(this.view.$("li.selected")).not.toExist();
        })

        describe("clicking on a list item", function() {
            beforeEach(function() {
                this.view.$("li:first").click();
            })

            it("marks the clicked item as selected", function() {
                expect(this.view.$("li:first")).toHaveClass("selected");
            })

            describe("clicking on another list item", function (){
                beforeEach(function() {
                    this.view.$("li:last").click();
                })
                it("marks the clicked item as selected", function() {
                    expect(this.view.$("li:last")).toHaveClass("selected");
                })
                it("unselects previously selected items", function() {
                    expect(this.view.$("li:first")).not.toHaveClass("selected");
                })
            })


        })
    })
})