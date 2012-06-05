describe("chorus.views.TabularDataList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseObjectSet([
            newFixtures.dataset.chorusView({ hasCredentials: true, objectName: "foo" }),
            newFixtures.dataset.sandboxTable({ hasCredentials: true, objectName: "bar" }),
            newFixtures.dataset.sourceTable({ hasCredentials: true, objectName: "baz" })
        ], { instanceId: "1", databaseName: "two", schemaName: "three" });
        this.collection.loaded = true;

        this.view = new chorus.views.TabularDataList({ collection: this.collection, activeWorkspace: true });
        this.view.render();
    });

    context("when the checkable flag is enabled", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, 'broadcast').andCallThrough();
            this.view.options.checkable = true;
            this.view.render();
            this.checkboxes = this.view.$("> li input[type=checkbox]");
        });

        it("renders a checkbox next to each dataset", function() {
            expect(this.checkboxes.length).toBe(this.collection.length);
        });

        describe("when a dataset is checked", function() {
            beforeEach(function() {
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

            describe("when returning to the same page after switching pages", function() {
                beforeEach(function() {
                    this.view.collection.fetch();
                    this.server.completeFetchFor(this.view.collection, this.view.collection.models);
                });

                it("keeps the same items checked", function() {
                    expect(this.view.$("input[type=checkbox]").filter(":checked").length).toBe(1);
                    expect(this.view.$("input[type=checkbox]").eq(1)).toBe(":checked");
                });
            });
        });

        describe("select all and select none", function() {
            context("when the selectAll page event is recieved", function() {
                beforeEach(function() {
                    spyOn(this.collection, 'fetchAll').andCallThrough();
                    chorus.PageEvents.broadcast("selectAll");
                });

                it("fetches all of the datasets", function() {
                    var fetch = this.server.lastFetchFor(this.collection);
                    expect(fetch.url).toContainQueryParams({ rows: 1000 });
                });

                describe("when the fetch completes", function() {
                    beforeEach(function() {
                        this.allDatasets = this.collection.models.concat([
                            newFixtures.dataset.sandboxTable(),
                            newFixtures.dataset.sandboxTable(),
                            newFixtures.dataset.sandboxTable()
                        ]);
                        this.server.completeFetchAllFor(this.collection, this.allDatasets);
                    });

                    it("checks all of the datasets", function() {
                        expect(this.view.$("input[type=checkbox]:checked").length).toBe(3);
                    });

                    it("broadcasts the 'tabularData:checked' page event with a collection of all datasets", function() {
                        expectDatasetChecked(this.allDatasets);
                    });
                });

                context("when the selectNone page event is received", function() {
                    beforeEach(function() {
                        chorus.PageEvents.broadcast("selectNone");
                    });

                    it("un-checks all of the datasets", function() {
                        expect(this.view.$("input[type=checkbox]:checked").length).toBe(0);
                    });

                    it("broadcasts the 'tabularData:checked' page event with an empty collection", function() {
                        expectDatasetChecked([]);
                    });
                });
            });
        });

        function expectDatasetChecked(expectedModels) {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalled();
            var eventName = chorus.PageEvents.broadcast.mostRecentCall.args[0]
            expect(eventName).toBe("tabularData:checked");

            var collection = chorus.PageEvents.broadcast.mostRecentCall.args[1];
            expect(collection).toBeA(chorus.collections.DatabaseObjectSet);
            expect(collection.pluck("id")).toEqual(_.pluck(expectedModels, "id"));
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

    describe("the no datasets message", function() {
        beforeEach(function() {
            this.view.collection = new chorus.collections.DatabaseObjectSet([], { instanceId: "1", databaseName: "two", schemaName: "three" });
            this.view.render();
        });

        it("should not display the browse more message", function() {
            expect(this.view.$(".browse_more")).not.toExist();
        });

        context("after the collection is loaded", function() {
            beforeEach(function() {
                this.view.collection.loaded = true;
                this.view.render();
            });

            it("renders the no datasets message if there are no datasets", function() {
                expect($(this.view.el)).toContainTranslation("dataset.browse_more", {linkText: "browse your instances"});
                expect(this.view.$(".browse_more a")).toHaveHref("#/instances");
            });
        });

        context("when it is a DatasetSet and a name filter is applied", function() {
            beforeEach(function() {
                this.view.collection = new chorus.collections.DatasetSet();
                this.view.collection.loaded = true;
                this.view.collection.attributes.namePattern = "Liger";
                this.view.render();
            });

            it("renders the no datasets message if there are no datasets", function() {
                expect($(this.view.el)).toContainTranslation("dataset.filtered_empty");
            });
        });
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
