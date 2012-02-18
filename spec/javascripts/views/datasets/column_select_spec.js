describe("chorus.views.ColumnSelect", function() {
    beforeEach(function() {
        stubDefer();
        this.selectMenuStub = stubSelectMenu();
        this.tabularData = fixtures.databaseTable();
        this.columns = this.tabularData.columns().reset([
            fixtures.databaseColumn({ name: "source_column_1" }),
            fixtures.databaseColumn({ name: "source_column_2" }),
            fixtures.databaseColumn({ name: "source_column_3" }),
            fixtures.databaseColumn({ name: "source_column_4", typeCategory: 'OTHER' })
        ]);
        this.view = new chorus.views.ColumnSelect({collection: this.columns});
    });

    describe("#render", function() {
        context("when the tabularData has a datasetNumber and the showDatasetNumbers option is disabled", function() {
            beforeEach(function() {
                this.tabularData.datasetNumber = 1;
                this.view.options.showDatasetNumbers = false;
                this.view.render();
            });

            it("does not have the dataset_number", function() {
                expect(this.selectMenuStub.find(".dataset_number")).not.toExist();
            });

            it("has all the columns", function() {
                expect(this.view.$('option').length).toBe(4);
            });

            context("when disableOtherTypeCategory is set", function() {
                beforeEach(function() {
                    this.view.options.disableOtherTypeCategory = true;
                    this.view.render();
                });

                it("disables columns with typeCategory 'OTHER'", function() {
                    expect(this.view.$('option:eq(3)')).toBeDisabled();
                });
            });

            context("when disableOtherTypeCategory is not set", function() {
                beforeEach(function() {
                    this.view.options.disableOtherTypeCategory = false;
                    this.view.render();
                });

                it("does not disables columns with typeCategory 'OTHER'", function() {
                    expect(this.view.$('option:eq(3)')).not.toBeDisabled();
                });
            });

            context("with an option selected", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, 'columnSelected');
                    this.selectedColumn = this.columns.models[2];
                    this.view.$("select option[data-cid="+this.selectedColumn.cid+"]").prop('selected', true).change();
                });

                it("triggers columnSelected", function() {
                    expect('columnSelected').toHaveBeenTriggeredOn(this.view, [this.selectedColumn]);
                });

                describe("getSelectedColumn", function() {
                    it("returns the correct column", function() {
                        expect(this.view.getSelectedColumn()).toBe(this.selectedColumn);
                    })
                })
            });
        });

        context("when the tabularData has no datasetNumber and the showDatasetNumbers option is enabled", function() {
            beforeEach(function() {
                this.view.options.showDatasetNumbers = true;
                this.view.render();
            });

            it("does not have the dataset_number", function() {
                expect(this.selectMenuStub.find(".dataset_number")).not.toExist();
            })
        });

        context("when the tabularData has a datasetNumber and the showDatasetNumbers option is enabled", function() {
            beforeEach(function() {
                this.tabularData.datasetNumber = 1;
                this.view.options.showDatasetNumbers = true;
                this.view.render();
            });

            it("has the dataset_number", function() {
                expect(this.selectMenuStub.find(".dataset_number")).toExist();
            })
        });
    });
});
