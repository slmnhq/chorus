describe("chorus.models.DatasetFilterMaps.string", function() {
    var strings = new chorus.models.DatasetFilterMaps.String;

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
            expect(strings.comparators[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(strings.comparators[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("marks all strings as valid", function() {
        expect(strings.performValidation({ value: "" })).toBeTruthy();
        expect(strings.performValidation({ value: "2342gegrerger*(&^%" })).toBeTruthy();
        expect(strings.performValidation({ value: "';DROP TABLE users;--" })).toBeTruthy();
        expect(strings.performValidation({ value: "\n                    \t" })).toBeTruthy();
    })
});

describe("chorus.models.DatasetFilterMaps.numeric", function() {
    var numericals = new chorus.models.DatasetFilterMaps.Numeric;

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
            expect(numericals.comparators[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(numericals.comparators[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("marks whole numbers as valid", function() {
        expect(numericals.performValidation({ value: "1234" })).toBeTruthy();
    })

    it("marks floating comma numbers as valid", function() {
        expect(numericals.performValidation({ value: "4,5" })).toBeTruthy();
    })

    it("marks floating point numbers as valid", function() {
        expect(numericals.performValidation({ value: "4.5" })).toBeTruthy();
    })

    it("marks non-numerical strings as invalid", function() {
        expect(numericals.performValidation({ value: "I'm the string" })).toBeFalsy();
    })

    it("marks negative numbers as invalid", function() {
        expect(numericals.performValidation({ value: "-1" })).toBeFalsy();
    })
});

describe("chorus.models.DatasetFilterMaps.time", function() {
    var time = new chorus.models.DatasetFilterMaps.Time;

    itReturnsTheRightClauseFor("equal", "column_name", "some_value", "\"column_name\" = 'some_value'")
    itReturnsTheRightClauseFor("before", "column_name", "some_value", "\"column_name\" < 'some_value'")
    itReturnsTheRightClauseFor("after", "column_name", "some_value", "\"column_name\" > 'some_value'")
    itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "\"column_name\" IS NOT NULL", true)
    itReturnsTheRightClauseFor("null", "column_name", "some_value", "\"column_name\" IS NULL", true)

    function itReturnsTheRightClauseFor(key, columnName, inputValue, expected, ignoreEmptyCase) {
        it("returns the right clause for " + key, function() {
            expect(time.comparators[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(time.comparators[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("marks times as valid", function() {
        expect(time.performValidation({ value: "13" })).toBeTruthy();
        expect(time.performValidation({ value: "13:37" })).toBeTruthy();
        expect(time.performValidation({ value: "31:13:37" })).toBeTruthy();
    })

    it("marks weird, time-like stings as valid", function() {
        expect(time.performValidation({ value: "13:" })).toBeTruthy();
        expect(time.performValidation({ value: "1:::37" })).toBeTruthy();
        expect(time.performValidation({ value: "::::::::" })).toBeTruthy();
    })

    it("marks anything but times as invalid", function() {
        expect(time.performValidation({ value: "4,5" })).toBeFalsy();
        expect(time.performValidation({ value: "Greetings" })).toBeFalsy();
        expect(time.performValidation({ value: "www.google.com" })).toBeFalsy();
        expect(time.performValidation({ value: "13.45" })).toBeFalsy();
        expect(time.performValidation({ value: "12am" })).toBeFalsy();
    })
});

describe("chorus.models.DatasetFilterMaps.date", function() {
    var date = new chorus.models.DatasetFilterMaps.Date;

    itReturnsTheRightClauseFor("on", "column_name", "some_value", "\"column_name\" = 'some_value'")
    itReturnsTheRightClauseFor("before", "column_name", "some_value", "\"column_name\" < 'some_value'")
    itReturnsTheRightClauseFor("after", "column_name", "some_value", "\"column_name\" > 'some_value'")
    itReturnsTheRightClauseFor("not_null", "column_name", "some_value", "\"column_name\" IS NOT NULL", true)
    itReturnsTheRightClauseFor("null", "column_name", "some_value", "\"column_name\" IS NULL", true)

    function itReturnsTheRightClauseFor(key, columnName, inputValue, expected, ignoreEmptyCase) {
        it("returns the right clause for " + key, function() {
            expect(date.comparators[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(date.comparators[key].generate(columnName, "")).toBe("");
            });
        }
    }
});
