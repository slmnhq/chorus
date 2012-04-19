describe("chorus.views.TabularDataList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([
            newFixtures.dataset.chorusView({ hasCredentials: true }),
            newFixtures.dataset.sandboxTable({ hasCredentials: true }),
            newFixtures.dataset.sourceTable({ hasCredentials: true })
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.TabularDataList({ collection: this.collection, activeWorkspace: true });
        this.view.render();
    });

    context("when the checkable flag is enabled", function() {
        beforeEach(function() {
            this.view.options.checkable = true;
            this.view.render();
            this.checkboxes = this.view.$("> li input[type=checkbox]");
        });

        it("renders a checkbox next to each dataset", function() {
            expect(this.checkboxes.length).toBe(this.collection.length);
        });

        describe("when a dataset is checked", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, 'broadcast');
                this.checkboxes.eq(1).click().change();
            });

            it("does not 'select' the dataset", function() {
                expect(this.view.$("li").eq(1)).not.toBe(".selected");
            });

            it("broadcasts the 'tabularData:checked' event with the collection of currently-checked datasets", function() {
                expectDatasetChecked([ this.collection.at(1) ]);
            });

            describe("checking another dataset", function() {
                beforeEach(function() {
                    this.checkboxes.eq(0).click().change();
                });

                it("broadcasts the 'tabularData:checked' event with the collection of currently-checked datasets", function() {
                    expectDatasetChecked([ this.collection.at(1), this.collection.at(0) ]);
                });

                describe("when one of the items is clicked again", function() {
                    beforeEach(function() {
                        this.checkboxes.eq(0).click().change();
                    });

                    it("broadcasts the 'tabularData:checked' event with an empty collection", function() {
                        expectDatasetChecked([ this.collection.at(1) ]);
                    });
                });
            });
        });

        function expectDatasetChecked(expectedModels) {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalled();
            var eventName = chorus.PageEvents.broadcast.mostRecentCall.args[0]
            expect(eventName).toBe("tabularData:checked");

            var collection = chorus.PageEvents.broadcast.mostRecentCall.args[1];
            expect(collection).toBeA(chorus.collections.TabularDataSet);

            expect(collection.models).toEqual(expectedModels);
        }
    });

    context("when the checkable flag is falsy", function() {
        it("does not render checkboxes", function() {
            expect(this.view.$("input[type=checkbox]")).not.toExist();
        });
    });

    it("renders a dataset view for each dataset", function() {
        expect(this.view.$("> li").length).toBe(this.collection.length);
    });

    it("should broadcast tabularData:selected when itemSelected is called", function() {
        var model = this.collection.at(1);
        spyOn(chorus.PageEvents, "broadcast");
        this.view.itemSelected(model);
        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("tabularData:selected", model);
    });

    it("pre-selects the first item by default", function() {
        expect(this.view.$("li").eq(0)).toHaveClass("selected");
    });

    it("passes the 'activeWorkspace' option to the dataset views, so that they render the links", function() {
        expect(this.view.$("li a.image").length).toBe(this.collection.length);
        expect(this.view.$("li a.name").length).toBe(this.collection.length);

        this.view = new chorus.views.TabularDataList({ collection: this.collection, activeWorkspace: false });
        this.view.render();

        expect(this.view.$("li a.image").length).toBe(0);
        expect(this.view.$("li a.name").length).toBe(0);
    });
});
