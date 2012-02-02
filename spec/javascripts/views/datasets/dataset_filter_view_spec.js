describe("chorus.views.DatasetFilter", function() {
    beforeEach(function () {
        this.collection = fixtures.databaseColumnSet();
        this.view = new chorus.views.DatasetFilter({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function () {
            // styleSelect is deferred, but call it immediately for these tests
            spyOn(_, "defer").andCallFake(function(f){return f()});
            spyOn(chorus, "styleSelect");

            this.view.render();
        });

        it("populates the filter's select options with the names of the columns", function() {
            expect(this.view.$(".column_filter option").length).toBe(this.collection.length);

            var view = this.view;
            this.collection.each(function(model){
                expect(view.$(".column_filter option")).toContainText(model.get("name"));
            });
        });

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        });

        it("displays remove button", function() {
            expect(this.view.$(".remove")).toExist();
        });

        describe("clicking on the remove button", function() {
            beforeEach(function () {
                spyOnEvent(this.view, "filterview:deleted");
                this.view.$(".remove").click();
            });

            it("raises the filterview:deleted event", function() {
                expect("filterview:deleted").toHaveBeenTriggeredOn(this.view, [this.view]);
            });
        });

        describe("columns with typeCategory: other", function() {
            beforeEach(function () {
                this.collection.models[1].set({typeCategory:"OTHER"});
                this.view.render();
            });

            it("disables the option for the 'other' column", function() {
                expect(this.view.$(".column_filter option[value='" + this.collection.models[1].get("name") + "']")).toHaveAttr("disabled");
                expect(this.view.$(".column_filter option[value='" + this.collection.models[0].get("name") + "']")).not.toHaveAttr("disabled");
            });
        });
        
        describe("#validateInput", function() {
            beforeEach(function() {
                this.collection.models[0].set({typeCategory:"REAL_NUMBER"});
                this.view.render();
                spyOn(chorus.views.DatasetFilter.numericMap, "validate");
                spyOn(this.view, "markInputAsInvalid");
                
                this.view.$("input.filter_input").val("123");
            });
            
            it("passes the input argument to the right method", function() {
                this.view.validateInput();
                
                expect(chorus.views.DatasetFilter.numericMap.validate).toHaveBeenCalledWith("123");
            });

            it("adds a qtip with invalid input", function() {
                chorus.views.DatasetFilter.numericMap.validate.andReturn(false);

                this.view.validateInput();

                expect(this.view.markInputAsInvalid).toHaveBeenCalled();
            });

            it("does not add a qtip with valid input", function() {
                chorus.views.DatasetFilter.numericMap.validate.andReturn(true);

                this.view.validateInput();

                expect(this.view.markInputAsInvalid).not.toHaveBeenCalled();
            });
        });

        describe("columns with typeCategory: STRING, LONG_STRING", function() {
            beforeEach(function () {
                this.collection.models[0].set({typeCategory:"STRING"});
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

                _.each(this.keys, function(key){
                    expect(view.$(".string option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing a comparator", function() {
                _.each(_.keys(chorus.views.DatasetFilter.stringMap), function(key){
                    if (chorus.views.DatasetFilter.stringMap[key].usesInput){
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).not.toHaveClass("hidden");
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).toHaveClass("hidden");
                        });
                    }
                });
            });

            describe("when the input is hidden and a new column is chosen and the default option should show the input", function() {
                beforeEach(function() {
                    this.view.$('input.filter_input').addClass('hidden')
                    this.view.$('.column_filter').prop("selectedIndex", 1).change();
                })

                it("should show the input box", function() {
                    expect(this.view.$('input.filter_input')).not.toHaveClass('hidden')
                })
            })
        });

        describe("columns with typeCategory: WHOLE_NUMBER, REAL_NUMBER", function() {
            beforeEach(function () {
                this.collection.models[0].set({typeCategory:"REAL_NUMBER"});
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

                _.each(this.keys, function(key){
                    expect(view.$(".numeric option")).toContainTranslation("dataset.filter." + key);
                });
            });

            describe("when choosing an option", function() {
                _.each(_.keys(chorus.views.DatasetFilter.numericMap), function(key){
                    if (chorus.views.DatasetFilter.numericMap[key].usesInput){
                        it("correctly shows the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).not.toHaveClass("hidden");
                        });
                    } else {
                        it("correctly hides the input for " + key, function() {
                            this.view.$(".comparator").val(key).change();
                            expect(this.view.$("input.filter_input")).toHaveClass("hidden");
                        });
                    }
                });
            });
        });

        describe("#filterString", function() {
            beforeEach(function () {
                this.collection.models[0].set({typeCategory:"STRING"});
                this.view.render();

                this.view.$(".comparator").val("not_equal").change();
                this.view.$(".filter_input").val("test")
                spyOn(chorus.views.DatasetFilter.stringMap.not_equal, "generate");
                this.view.filterString();
            });

            it("calls the generate function of the correct filter type", function() {
                expect(chorus.views.DatasetFilter.stringMap.not_equal.generate).toHaveBeenCalledWith(this.collection.models[0].get("name"), "test");
            });
        });
    });
});

describe("chorus.views.DatasetFilter.stringMap", function() {
    itReturnsTheRightClauseFor("equal", "column_name", "some_value", "\"column_name\" = 'some_value'")
    itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "\"column_name\" != 'some_value'")
    itReturnsTheRightClauseFor("like", "column_name", "some_value", "\"column_name\" LIKE 'some_value'")
    itReturnsTheRightClauseFor("begin_with", "column_name", "some_value", "\"column_name\" = 'some_value%'")
    itReturnsTheRightClauseFor("end_with", "column_name", "some_value", "\"column_name\" = '%some_value'")
    itReturnsTheRightClauseFor("alpha_after", "column_name", "some_value", "\"column_name\" > 'some_value'")
    itReturnsTheRightClauseFor("alpha_after_equal", "column_name", "some_value", "\"column_name\" >= 'some_value'")
    itReturnsTheRightClauseFor("alpha_before", "column_name", "some_value", "\"column_name\" < 'some_value'")
    itReturnsTheRightClauseFor("alpha_before_equal", "column_name", "some_value", "\"column_name\" <= 'some_value'")
    itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "\"column_name\" IS NOT NULL", true)
    itReturnsTheRightClauseFor("null", "column_name", "some_value", "\"column_name\" IS NULL", true)

    function itReturnsTheRightClauseFor(key, columnName, inputValue, expected, ignoreEmptyCase) {
        it("returns the right clause for " + key, function() {
            expect(chorus.views.DatasetFilter.stringMap[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(chorus.views.DatasetFilter.stringMap[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("marks all strings as valid", function() {
        expect(chorus.views.DatasetFilter.stringMap.validate("")).toBeTruthy();
        expect(chorus.views.DatasetFilter.stringMap.validate("2342gegrerger*(&^%")).toBeTruthy();
        expect(chorus.views.DatasetFilter.stringMap.validate("';DROP TABLE users;--")).toBeTruthy();
        expect(chorus.views.DatasetFilter.stringMap.validate("\n                    \t")).toBeTruthy();
    })
});

describe("chorus.views.DatasetFilter.numericMap", function() {
    itReturnsTheRightClauseFor("equal", "column_name", "some_value", "\"column_name\" = 'some_value'")
    itReturnsTheRightClauseFor("not_equal", "column_name", "some_value", "\"column_name\" != 'some_value'")
    itReturnsTheRightClauseFor("greater", "column_name", "some_value", "\"column_name\" > 'some_value'")
    itReturnsTheRightClauseFor("greater_equal", "column_name", "some_value", "\"column_name\" >= 'some_value'")
    itReturnsTheRightClauseFor("less", "column_name", "some_value", "\"column_name\" < 'some_value'")
    itReturnsTheRightClauseFor("less_equal", "column_name", "some_value", "\"column_name\" <= 'some_value'")
    itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "\"column_name\" IS NOT NULL", true)
    itReturnsTheRightClauseFor("null", "column_name", "some_value", "\"column_name\" IS NULL", true)

    function itReturnsTheRightClauseFor(key, columnName, inputValue, expected, ignoreEmptyCase) {
        it("returns the right clause for " + key, function() {
            expect(chorus.views.DatasetFilter.numericMap[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(chorus.views.DatasetFilter.numericMap[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("mark whole numbers as valid", function() {
        expect(chorus.views.DatasetFilter.numericMap.validate("1234")).toBeTruthy();
    })

    it("mark floating comma numbers as valid", function() {
        expect(chorus.views.DatasetFilter.numericMap.validate("4,5")).toBeTruthy();
    })

    it("mark floating point numbers as valid", function() {
        expect(chorus.views.DatasetFilter.numericMap.validate("4.5")).toBeTruthy();
    })

    it("mark non-numerical strings as invalid", function() {
        expect(chorus.views.DatasetFilter.numericMap.validate("I'm the string")).toBeFalsy();
    })

    it("mark negative numbers as invalid", function() {
        expect(chorus.views.DatasetFilter.numericMap.validate("-1")).toBeFalsy();
    })
});