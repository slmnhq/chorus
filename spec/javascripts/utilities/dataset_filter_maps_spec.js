
describe("chorus.utilities.DatasetFilterMaps.string", function() {
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
            expect(chorus.utilities.DatasetFilterMaps.string[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(chorus.utilities.DatasetFilterMaps.string[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("marks all strings as valid", function() {
        expect(chorus.utilities.DatasetFilterMaps.string.validate("")).toBeTruthy();
        expect(chorus.utilities.DatasetFilterMaps.string.validate("2342gegrerger*(&^%")).toBeTruthy();
        expect(chorus.utilities.DatasetFilterMaps.string.validate("';DROP TABLE users;--")).toBeTruthy();
        expect(chorus.utilities.DatasetFilterMaps.string.validate("\n                    \t")).toBeTruthy();
    })
});

describe("chorus.utilities.DatasetFilterMaps.numeric", function() {
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
            expect(chorus.utilities.DatasetFilterMaps.numeric[key].generate(columnName, inputValue)).toBe(expected);
        });

        if (!ignoreEmptyCase) {
            it("returns an empty string when input is empty for " + key, function() {
                expect(chorus.utilities.DatasetFilterMaps.numeric[key].generate(columnName, "")).toBe("");
            });
        }
    }

    it("mark whole numbers as valid", function() {
        expect(chorus.utilities.DatasetFilterMaps.numeric.validate("1234")).toBeTruthy();
    })

    it("mark floating comma numbers as valid", function() {
        expect(chorus.utilities.DatasetFilterMaps.numeric.validate("4,5")).toBeTruthy();
    })

    it("mark floating point numbers as valid", function() {
        expect(chorus.utilities.DatasetFilterMaps.numeric.validate("4.5")).toBeTruthy();
    })

    it("mark non-numerical strings as invalid", function() {
        expect(chorus.utilities.DatasetFilterMaps.numeric.validate("I'm the string")).toBeFalsy();
    })

    it("mark negative numbers as invalid", function() {
        expect(chorus.utilities.DatasetFilterMaps.numeric.validate("-1")).toBeFalsy();
    })
});