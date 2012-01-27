describe("chorus.views.DatasetList", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.DatasetSet([fixtures.datasetChorusView(), fixtures.datasetSandboxTable(), fixtures.datasetSourceTable()]);
            this.view = new chorus.views.DatasetList({collection: this.collection});
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

        it("displays the location of the dataset", function() {
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li .location").eq(i).find("a").eq(0).text()).toBe(model.get("instance").name);
                expect(this.view.$("li .location").eq(i).find("a").eq(1).text()).toBe(model.get("databaseName"));
                expect(this.view.$("li .location").eq(i).find("a").eq(2).text()).toBe(model.get("schemaName"));
            }
        })

        it("pre-selects the first item", function() {
            expect(this.view.$("li").eq(0)).toHaveClass("selected");
        });

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
});
