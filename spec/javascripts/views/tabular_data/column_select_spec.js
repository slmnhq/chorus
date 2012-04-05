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

    it("does not re-render whenever columns are added to the collection (which happens a LOT)", function() {
        expect(this.view.persistent).toBeTruthy();
    });

    describe("#render", function() {
        context("when the tabularData has a datasetNumber and the showAliasedName option is disabled", function() {
            beforeEach(function() {
                this.tabularData.datasetNumber = 1;
                this.view.options.showAliasedName = false;
                this.view.render();
            });

            it("does not have the aliased_name", function() {
                expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
            });

            it("has all the columns", function() {
                expect(this.view.$('option').length).toBe(4);
            });

            context("when the collection is modified by a join", function() {
                beforeEach(function() {
                    spyOn(this.view, "postRender");
                    this.columns.trigger("join:added");
                });

                it("re-renders", function() {
                    expect(this.view.postRender).toHaveBeenCalled();
                });
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
                    this.view.selectColumn(this.selectedColumn);
                });

                it("triggers columnSelected", function() {
                    expect('columnSelected').toHaveBeenTriggeredOn(this.view, [this.selectedColumn]);
                });

                describe("getSelectedColumn", function() {
                    it("returns the correct column", function() {
                        expect(this.view.getSelectedColumn()).toBe(this.selectedColumn);
                    })
                })

                describe("rerender", function() {
                    beforeEach(function() {
                        this.view.render();
                    })

                    it("keeps the same column selected", function() {
                        expect(this.view.$("select option[data-cid="+this.selectedColumn.cid+"]")).toBeSelected();
                        expect(this.view.getSelectedColumn()).toBe(this.selectedColumn);
                    });
                });
            });

            describe("#selectColumn", function() {
                beforeEach(function() {
                    spyOn(this.view, 'refresh');
                });

                it("should select the given column", function() {
                    var selected = this.columns.at(2)
                    this.view.selectColumn(selected);
                    expect(this.view.$('select option:selected').data('cid')).toBe(selected.cid);
                    expect(this.view.getSelectedColumn()).toBe(this.columns.at(2));

                    expect(this.view.refresh).toHaveBeenCalled();
                });

                it("should select the first column if given nothing", function() {
                    this.view.selectColumn();
                    expect(this.view.$('select option:selected').data('cid')).toBe(this.columns.at(0).cid);
                    expect(this.view.getSelectedColumn()).toBe(this.columns.at(0));
                    expect(this.view.refresh).toHaveBeenCalled();
                });
            });
        });

        context("when the tabularData has no datasetNumber and the showAliasedName option is enabled", function() {
            beforeEach(function() {
                this.view.options.showAliasedName = true;
                this.view.render();
            });

            it("does not have the aliased_name", function() {
                expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
            })
        });

        context("when the tabularData has a datasetNumber and the showAliasedName option is enabled", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
                this.view.options.showAliasedName = true;
                this.view.render();
            });

            it("has the aliased_name", function() {
                expect(this.selectMenuStub.find(".aliased_name")).toExist();
            });
        });
    });

    describe("valid", function() {
        context("when there is no selected column", function() {
            it('returns true', function() {
                expect(this.view.valid()).toBeTruthy();
            });
        })

        context("when the selectedColumn is in the collection", function() {
            beforeEach(function() {
                this.view.selectedColumn = this.columns.at(0);
            });

            it('returns true', function() {
                expect(this.view.valid()).toBeTruthy();
            });
        });

        context("when the selectedColumn is not in the collection", function() {
            beforeEach(function() {
                this.view.selectedColumn = this.columns.at(0);
                this.columns.remove(this.view.selectedColumn);
            });

            it('returns false', function() {
                expect(this.view.valid()).toBeFalsy();
            });
        });
    });
});
