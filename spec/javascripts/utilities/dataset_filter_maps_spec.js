describe("chorus.utilities.DatasetFilterMaps.string", function() {
    var strings = chorus.utilities.DatasetFilterMaps.string;
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
        expect(strings.validate("")).toBeTruthy();
        expect(strings.validate("2342gegrerger*(&^%")).toBeTruthy();
        expect(strings.validate("';DROP TABLE users;--")).toBeTruthy();
        expect(strings.validate("\n                    \t")).toBeTruthy();
    })
});

describe("chorus.utilities.DatasetFilterMaps.numeric", function() {
    var numericals = chorus.utilities.DatasetFilterMaps.numeric;
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
        expect(numericals.validate("1234")).toBeTruthy();
    })

    it("marks floating comma numbers as valid", function() {
        expect(numericals.validate("4,5")).toBeTruthy();
    })

    it("marks floating point numbers as valid", function() {
        expect(numericals.validate("4.5")).toBeTruthy();
    })

    it("marks non-numerical strings as invalid", function() {
        expect(numericals.validate("I'm the string")).toBeFalsy();
    })

    it("marks negative numbers as invalid", function() {
        expect(numericals.validate("-1")).toBeFalsy();
    })
});

describe("chorus.utilities.DatasetFilterMaps.time", function() {
    var time = chorus.utilities.DatasetFilterMaps.time;
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
        expect(time.validate("13")).toBeTruthy();
        expect(time.validate("13:37")).toBeTruthy();
        expect(time.validate("31:13:37")).toBeTruthy();
    })

    it("marks weird, time-like stings as valid", function() {
        expect(time.validate("13:")).toBeTruthy();
        expect(time.validate("1:::37")).toBeTruthy();
        expect(time.validate("::::::::")).toBeTruthy();
    })

    it("marks anything but times as invalid", function() {
        expect(time.validate("4,5")).toBeFalsy();
        expect(time.validate("Greetings")).toBeFalsy();
        expect(time.validate("www.google.com")).toBeFalsy();
        expect(time.validate("13.45")).toBeFalsy();
        expect(time.validate("12am")).toBeFalsy();
    })
});

describe("chorus.utilities.DatasetFilterMaps.date", function() {
    var date = chorus.utilities.DatasetFilterMaps.date;
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