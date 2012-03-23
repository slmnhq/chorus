describe("chorus.views.DatasetFilter", function() {
    beforeEach(function() {
        this.tabularData = fixtures.datasetSourceTable();
        this.collection = fixtures.databaseColumnSet(null, {tabularData: this.tabularData});
        this.view = new chorus.views.DatasetFilter({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            stubDefer();
            this.selectMenuStub = stubSelectMenu();
            spyOn(chorus, "styleSelect").andCallThrough();
            spyOn(chorus, 'datePicker').andCallThrough();

            this.view.render();
            $("#jasmine_content").append(this.view.el);
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.collection.length);

            var view = this.view;
            this.collection.each(function(model, index){
                var option = view.$(".column_filter option:eq(" + index + ")");
                expect(option).toContainText(model.get("name"));
                expect(option).toHaveAttr("value", chorus.Mixins.dbHelpers.safePGName(this.collection.at(index).get("parentName"), model.get("name")));
            }, this);
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("gives long comparators enough room", function() {
            expect(chorus.styleSelect.mostRecentCall.args[1].menuWidth).toBe(240);
        });

        it("creates a datepicker widget associated with the year, month and day input fields", function() {
            expect(chorus.datePicker).toHaveBeenCalled();

            var datePickerOptions = chorus.datePicker.mostRecentCall.args[0];
            expect(datePickerOptions["%Y"]).toBe(this.view.$(".filter.date input[name='year']"));
            expect(datePickerOptions["%m"]).toBe(this.view.$(".filter.date input[name='month']"));
            expect(datePickerOptions["%d"]).toBe(this.view.$(".filter.date input[name='day']"));
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        it("does not have the aliased_name", function() {
            expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
        })

        context("when the tabularData has an aliasedName and the showAliasedName option is enabled", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
                this.view = new chorus.views.DatasetFilter({collection: this.collection, showAliasedName: true});
                this.view.render();
            });

            it("has the aliased_name options", function() {
                expect(this.selectMenuStub.find(".aliased_name")).toExist();
                expect(this.selectMenuStub.find(".aliased_name .letter")).toContainText(this.tabularData.aliasedName);
            });
        })

        context("when the tabularData has a datasetNumber and the datasetNumbers option is disabled", function() {
            beforeEach(function() {
                this.tabularData.setDatasetNumber(1);
                this.view.options.showAliasedName = false;
                this.view.render();
            });

            it("does not have the aliased_name", function() {
                expect(this.selectMenuStub.find(".aliased_name")).not.toExist();
            })
        })

        describe("clicking on the remove button", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "filterview:deleted");
                this.view.$(".remove").click();
            });

            it("raises the filterview:deleted event", function() {
                expect("filterview:deleted").toHaveBeenTriggeredOn(this.view, [this.view]);
            });
        });

        describe("columns with typeCategory: OTHER", function() {
            beforeEach(function() {
                this.collection.models[1].set({typeCategory: "OTHER"});
                this.view.render();
            });

            it("does not disable the option for the 'other' column", function() {
                expect(this.view.$(".column_filter option:eq(1)")).not.toBeDisabled();
                expect(this.view.$(".column_filter option:eq(0)")).not.toBeDisabled();
            });
        });

        describe("#validateInput", function() {
            describe("with a numeric column", function() {
                beforeEach(function() {
                    this.collection.models[0].set({typeCategory: "REAL_NUMBER"});
                    this.view.render();
                    spyOn(this.view.model, "performValidation").andCallThrough();
                    spyOn(this.view, "markInputAsInvalid");

                    this.view.$(".filter.default input").val("123");
                });

                it("passes the input argument to the right method", function() {
                    this.view.validateInput();
                    expect(this.view.model).toBeA(chorus.models.DatasetFilterMaps.Numeric);
                    expect(this.view.model.performValidation).toHaveBeenCalledWith({ value: "123" });
                });

                it("adds a qtip with invalid input", function() {
                    this.view.$(".filter.default input").val("abc");
                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).toHaveBeenCalled();
                    var args = this.view.markInputAsInvalid.mostRecentCall.args;

                    expect(args[0]).toBe(this.view.$(".filter.default input"));
                    expect(args[1]).toMatchTranslation("dataset.filter.number_required");
                });

                it("does not add a qtip with valid input", function() {
                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
                });
            });

            describe("with a date column", function() {
                beforeEach(function() {
                    this.collection.models[0].set({ typeCategory: "DATE" });
                    this.view.render();

                    spyOn(this.view.model, "performValidation");
                    spyOn(this.view, "markInputAsInvalid").andCallThrough();

                    this.view.$(".filter.date input[name='year']").val("2012");
                    this.view.$(".filter.date input[name='month']").val("2");
                    this.view.$(".filter.date input[name='day']").val("14");
                });

                it("passes the input argument to the right method", function() {
                    this.view.validateInput();

                    expect(this.view.model).toBeA(chorus.models.DatasetFilterMaps.Date);
                    expect(this.view.model.performValidation).toHaveBeenCalledWith({
                        year: "2012",
                        month: "2",
                        day: "14",
                        value: "2012/2/14"
                    });
                });

                it("adds a qtip with invalid input", function() {
                    var qtipElement = stubQtip();

                    this.view.model.performValidation.andCallFake(function() {
                        this.errors = { month: "bad month" };
                        return false;
                    });

                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).toHaveBeenCalled();
                    var args = this.view.markInputAsInvalid.mostRecentCall.args;
                    expect(args[0]).toBe(this.view.$(".filter.date input[name='month']"));
                    expect(args[1]).toBe("bad month");
                });

                it("does not add a qtip with valid input", function() {
                    this.view.model.performValidation.andReturn(true);

                    this.view.validateInput();

                    expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
                });
            });
        });

        describe("columns with typeCategory: STRING, LONG_STRING", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "STRING"});
                this.view.render();

                this.keys = [
                    "equal",
                    "not_equal",
                    "null",
                    "not_null",
                    "like",
                    "begin_with",
                    "end_with",
                    "alpha_after",
                    "alpha_after_equal",
                    "alpha_before",
                    "alpha_before_equal"
                ];
            });

            it("adds a second select with the string options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing a comparator", function() {
                _.each(_.keys(chorus.models.DatasetFilterMaps.String.prototype.comparators), function(key) {
                    if (chorus.models.DatasetFilterMaps.String.prototype.comparators[key].usesInput) {
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeVisible();
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeHidden();
                        });
                    }
                });
            });

            describe("when the input is hidden and a new column is chosen and the default option should show the input", function() {
                beforeEach(function() {
                    this.view.$('select.comparator').prop("selectedIndex", 3).change();
                    expect(this.view.$('.filter.default')).toHaveClass('hidden')
                    this.view.$('.column_filter select').prop("selectedIndex", 1).change();
                })

                it("should show the input box", function() {
                    expect(this.view.$('.filter.default')).not.toHaveClass('hidden')
                })
            })
        });

        describe("columns with typeCategory: BOOLEAN", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "BOOLEAN"});
                this.view.render();
                this.keys = _.keys(chorus.models.DatasetFilterMaps.Boolean.prototype.comparators);
            });

            it("adds a second select with the string options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });
        });

        describe("columns with typeCategory: WHOLE_NUMBER, REAL_NUMBER", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "REAL_NUMBER"});
                this.view.render();

                this.keys = [
                    "equal",
                    "not_equal",
                    "null",
                    "not_null",
                    "greater",
                    "greater_equal",
                    "less",
                    "less_equal"
                ];
            });

            it("adds a second select with the numeric options", function() {
                var view = this.view;

                _.each(this.keys, function(key) {
                    expect(view.$("option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing an option", function() {
                _.each(_.keys(chorus.models.DatasetFilterMaps.Numeric.prototype.comparators), function(key) {
                    if (chorus.models.DatasetFilterMaps.Numeric.prototype.comparators[key].usesInput) {
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeVisible();
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$(".filter.default input")).toBeHidden();
                        });
                    }
                });
            });
        });

        describe("columns with typeCategory: DATE", function() {
            beforeEach(function() {
                this.collection.models[0].set({ typeCategory: "DATE" });
                this.view.render();

                this.comparatorTypes = [
                    "on",
                    "null",
                    "not_null",
                    "before",
                    "after"
                ];

                this.typesRequiringArgument = [
                    "on",
                    "before",
                    "after"
                ];

                this.typesNotRequiringArgument = [
                    "null",
                    "not_null"
                ];
            });

            it("adds a second select with all of the comparator options for date columns", function() {
                _.each(this.comparatorTypes, function(comparatorType) {
                    expect(this.view.$("select.comparator option")).toContainTranslation("dataset.filter." + comparatorType);
                }, this);
            });

            describe("when a comparator is selected that requires a second argument", function() {
                it("it shows the second input field ", function() {
                    _.each(this.typesRequiringArgument, function(comparatorType) {
                        this.view.$(".comparator").val(comparatorType).change();
                        expect(this.view.$(".filter.date")).not.toHaveClass("hidden");
                        expect(this.view.$(".filter.date input[name='year']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.year");
                        expect(this.view.$(".filter.date input[name='month']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.month");
                        expect(this.view.$(".filter.date input[name='day']").attr("placeholder")).toMatchTranslation("datepicker.placeholder.day");
                    }, this);
                });

                it("shows the date picker icon next to the input field", function() {
                    this.view.$(".comparator").val("on").change();
                    expect(this.view.$("a.date-picker-control")).toBeVisible();
                });

            });

            describe("when a comparator is selected that does *not* require a second argument", function() {
                it("it hides the second input field ", function() {
                    _.each(this.typesNotRequiringArgument, function(comparatorType) {
                        this.view.$(".comparator").val(comparatorType).change();
                        expect(this.view.$(".filter.date input")).toBeHidden();
                    }, this);
                });

                it("hides the date picker icon", function() {
                    this.view.$(".comparator").val("not_null").change();
                    expect(this.view.$("a.date-picker-control")).toBeHidden();
                });
            });
        });

        describe("columns with typeCategory: DATETIME", function() {
            beforeEach(function() {
                this.collection.models[0].set({ typeCategory: "DATETIME" });
                this.view.render();
            })

            it("uses the Timestamp type", function() {
                expect(this.view.model).toBeA(chorus.models.DatasetFilterMaps.Timestamp);
            })
        });

        describe("#filterString", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory: "STRING"});
                this.view.render();

                this.view.$(".comparator").val("not_equal").change();
                this.view.$(".filter.default input").val("test")
                spyOn(this.view.model.comparators.not_equal, "generate");
                this.view.filterString();
            });

            it("calls the generate function of the correct filter type", function() {
                var model = this.collection.at(0);
                var qualifiedName = chorus.Mixins.dbHelpers.safePGName(model.get("parentName"), model.get("name"));
                expect(this.view.model.comparators.not_equal.generate).toHaveBeenCalledWith(qualifiedName, "test");
            });
        });

        describe("#fieldValues", function() {
            beforeEach(function() {
                this.view.$(".filter.default input").val("123");
                this.view.$(".filter.time input").val("12:34");
                this.view.$(".filter.date input[name='year']").val("04");
                this.view.$(".filter.date input[name='month']").val("12");
                this.view.$(".filter.date input[name='day']").val("3");
            });

            describe("with a string column", function() {
                it("returns the value of the default filter input", function() {
                    this.view.model = new chorus.models.DatasetFilterMaps.String;
                    expect(this.view.fieldValues()).toEqual({ value: "123" });
                });
            });

            describe("with a numeric column", function() {
                it("returns the value of the default filter input", function() {
                    this.view.model = new chorus.models.DatasetFilterMaps.Numeric;
                    expect(this.view.fieldValues()).toEqual({ value: "123" });
                });
            });

            describe("with a time column", function() {
                it("returns the value of the time filter input", function() {
                    this.view.model = new chorus.models.DatasetFilterMaps.Time;
                    expect(this.view.fieldValues()).toEqual({ value: "12:34" });
                });
            });

            describe("with a date column", function() {
                beforeEach(function() {
                    this.view.model = new chorus.models.DatasetFilterMaps.Date;
                });

                it("returns the values of the date filter inputs", function() {
                    expect(this.view.fieldValues().month).toBe("12");
                    expect(this.view.fieldValues().year).toBe("04");
                    expect(this.view.fieldValues().day).toBe("3");
                });

                describe("when the fields are populated", function() {
                    it("includes a 'value' field, which formats the year, month and day properly", function() {
                        expect(this.view.fieldValues().value).toBe("04/12/3");
                    });
                });

                describe("when the fields are blank", function() {
                    beforeEach(function() {
                        this.view.$(".filter.date input[name='year']").val("");
                        this.view.$(".filter.date input[name='month']").val("");
                        this.view.$(".filter.date input[name='day']").val("");
                    });

                    it("includes a blank 'value' field", function() {
                        expect(this.view.fieldValues().value).toBe("");
                    });
                });
            });
        })
    });

    describe("#valid", function() {
        context("when the columnFilter is valid", function() {
            beforeEach(function() {
                spyOn(this.view.columnFilter, 'valid').andReturn(true);
            })

            it("returns true", function() {
                expect(this.view.valid()).toBeTruthy();
            })
        })

        context("when the columnFilter is not valid", function() {
            beforeEach(function() {
                spyOn(this.view.columnFilter, 'valid').andReturn(false);
            })

            it("returns false", function() {
                expect(this.view.valid()).toBeFalsy();
            })
        })
    })
});
