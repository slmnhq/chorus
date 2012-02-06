describe("chorus.views.DatasetList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([fixtures.datasetChorusView(), fixtures.datasetSandboxTable(), fixtures.datasetSourceTable({recentComment: null })]);
        this.collection.loaded = true;
        this.view = new chorus.views.DatasetList({collection: this.collection});
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders an item for each dataset", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("links the datasets to their show page", function() {
            _.each(this.collection.models, function(dataset, index) {
                expect(this.view.$("li:eq(" + index + ") a.name")).toHaveAttr("href", this.collection.at(index).showUrl())
            }, this);
        })

        it("displays the datasets' names", function() {
            for (var i = 0; i < this.collection.length; i++) {
                expect(this.view.$("a.name").eq(i).text().trim()).toBe(this.collection.models[i].get("objectName"));
            }
        })

        it("displays an icon for each dataset", function() {
            expect(this.view.$("li img").length).toBe(3);
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li img").eq(i).attr("src")).toBe(model.iconUrl());
            }
        });

        it("does not create comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(2) .comment")).not.toExist();
        });

        it("creates comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(0) .comment")).toExist();
        });

        it("does not render the disabled names", function() {
            expect(this.view.$(".name_disabled")).not.toExist();
        });

        context("when browsingSchema is true", function() {
            beforeEach(function() {
                this.view.options.browsingSchema = true;
                this.view.render();
            });

            it("does not link the datasets' names", function() {
                expect(this.view.$("a.name")).not.toExist();
            });

            it("does not link the datasets' image", function() {
                expect(this.view.$("a img")).not.toExist();
            });

            it("does include the datasets' image", function() {
                expect(this.view.$("div.image img")).toExist();
            });

            it("does renders the disabled names", function() {
                expect(this.view.$(".name_disabled")).toExist();
            });

            xit("includes the 'found in workspace' information", function() {
            });
        });


        it("displays the location of the dataset", function() {
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li .location").eq(i).find("a").eq(0).text()).toBe(model.get("instance").name);
                expect(this.view.$("li .location").eq(i).find("a").eq(1).text()).toBe(model.get("databaseName"));
                expect(this.view.$("li .location").eq(i).find("a").eq(2).text()).toBe(model.get("schemaName"));
            }
        })

        context("when no item was previously selected", function() {
            it("pre-selects the first item", function() {
                expect(this.view.$("li").eq(0)).toHaveClass("selected");
            });
        });

        context("when an item was previously selected", function() {
            beforeEach(function() {
                this.view.$("li:eq(1)").click();
                this.view.render();
            })

            it("restores that item selection", function() {
                expect(this.view.$("li").eq(0)).not.toHaveClass("selected");
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            })
        })

        describe("clicking an li", function() {
            beforeEach(function() {
                this.selectedSpy = jasmine.createSpy("li selected");
                this.view.bind("dataset:selected", this.selectedSpy);
                this.view.$("li").eq(1).click();
            });

            it("selects only that item", function() {
                expect(this.view.$("li.selected").length).toBe(1);
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            });

            it("triggers dataset:selected with an argument of the selected dataset", function() {
                expect(this.selectedSpy).toHaveBeenCalledWith(this.collection.models[1]);
            });
        });
    });

    describe("event handling", function() {
        describe("when the page model is invalidated", function() {
            beforeEach(function() {
                this.view.render();
                spyOn(this.view.collection, "fetch")
                this.view.$("li:eq(1)").click();
                this.collection.at(1).trigger("invalidated")
            })

            it("re-fetches the collection", function() {
                expect(this.view.collection.fetch).toHaveBeenCalled();
            })
        })
    })
});
