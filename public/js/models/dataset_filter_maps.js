(function() {
    chorus.models.DatasetFilterMaps = {};

    chorus.models.DatasetFilterMaps.String = chorus.models.Base.extend({
        type: "String",

        comparators: {
            "equal": {usesInput: true, generate: makeGenerate("=") },
            "not_equal": {usesInput: true, generate: makeGenerate("!=") },
            "null": {usesInput: false, generate: isNull },
            "not_null": {usesInput: false, generate: isNotNull },
            "like": {usesInput: true, generate: makeGenerate("LIKE") },
            "begin_with": {usesInput: true, generate: makeGenerate("LIKE", {inputSuffix: '%'}) },
            "end_with": {usesInput: true, generate: makeGenerate("LIKE", {inputPrefix: '%'}) },
            "alpha_after": {usesInput: true, generate: makeGenerate(">") },
            "alpha_after_equal": {usesInput: true, generate: makeGenerate(">=") },
            "alpha_before": {usesInput: true, generate: makeGenerate("<") },
            "alpha_before_equal": {usesInput: true, generate: makeGenerate("<=") }
        },

        declareValidations: function(attrs) {
            return true
        }
    });

    chorus.models.DatasetFilterMaps.Boolean = chorus.models.Base.extend({
        type: "Boolean",

        comparators: {
            "true": {usesInput: false, generate: isTrue },
            "false": {usesInput: false, generate: isFalse },
            "null": {usesInput: false, generate: isNull },
            "not_null": {usesInput: false, generate: isNotNull }
        },

        declareValidations: function(attrs) {
            return true
        }
    });

    chorus.models.DatasetFilterMaps.Numeric = chorus.models.Base.extend({
        type: "Numeric",

        comparators: {
            "equal": {usesInput: true, generate: makeGenerate("=") },
            "not_equal": {usesInput: true, generate: makeGenerate("!=") },
            "null": {usesInput: false, generate: isNull },
            "not_null": {usesInput: false, generate: isNotNull },
            "greater": {usesInput: true, generate: makeGenerate(">") },
            "greater_equal": {usesInput: true, generate: makeGenerate(">=") },
            "less": {usesInput: true, generate: makeGenerate("<") },
            "less_equal": {usesInput: true, generate: makeGenerate("<=") }
        },

        declareValidations: function(attrs) {
            this.requirePattern("value", /^-?[0-9]+[.,]?[0-9]*$/, attrs, "dataset.filter.number_required", "allowBlank");
        }
    });

    chorus.models.DatasetFilterMaps.Timestamp = chorus.models.Base.extend({
        type: "Timestamp",

        comparators: {
            "equal": {usesInput: true, generate: makeGenerate("=") },
            "not_equal": {usesInput: true, generate: makeGenerate("!=") },
            "null": {usesInput: false, generate: isNull },
            "not_null": {usesInput: false, generate: isNotNull },
            "greater": {usesInput: true, generate: makeGenerate(">") },
            "greater_equal": {usesInput: true, generate: makeGenerate(">=") },
            "less": {usesInput: true, generate: makeGenerate("<") },
            "less_equal": {usesInput: true, generate: makeGenerate("<=") }
        },

        declareValidations: function(attrs) {
            return true;
        }
    });

    chorus.models.DatasetFilterMaps.Time = chorus.models.Base.extend({
        type: "Time",

        comparators: {
            "equal": {usesTimeInput: true, generate: makeGenerate("=") },
            "before": {usesTimeInput: true, generate: makeGenerate("<") },
            "after": {usesTimeInput: true, generate: makeGenerate(">") },
            "null": {usesTimeInput: false, generate: isNull },
            "not_null": {usesTimeInput: false, generate: isNotNull }
        },

        declareValidations: function(attrs) {
            this.requirePattern("value", chorus.ValidationRegexes.Time(), attrs, "dataset.filter.time_required", "allowBlank");
        }
    });

    chorus.models.DatasetFilterMaps.Date = chorus.models.Base.extend({
        type: "Date",

        comparators: {
            "on": {usesDateInput: true, generate: makeGenerate("=") },
            "before": {usesDateInput: true, generate: makeGenerate("<") },
            "after": {usesDateInput: true, generate: makeGenerate(">") },
            "null": {usesDateInput: false, generate: isNull },
            "not_null": {usesDateInput: false, generate: isNotNull }
        },

        declareValidations: function(attrs) {
            if (attrs["year"] == "" && attrs["month"] == "" && attrs["day"] == "") return;

            this.requirePattern("year", chorus.ValidationRegexes.Year(), attrs, "dataset.filter.year_required");
            this.requirePattern("month", chorus.ValidationRegexes.Month(), attrs, "dataset.filter.month_required");
            this.requirePattern("day", chorus.ValidationRegexes.Day(), attrs, "dataset.filter.day_required");
        }
    });

    chorus.models.DatasetFilterMaps.Other = chorus.models.DatasetFilterMaps.Numeric.extend({
        type: "Other",

        declareValidations: function(attrs) {
        }
    });

    function isTrue(columnName) {
        return columnName + " = TRUE";
    }

    function isFalse(columnName) {
        return columnName + " = FALSE";
    }

    function isNull(columnName, inputValue) {
        return columnName + " IS NULL";
    }

    function isNotNull(columnName, inputValue) {
        return columnName + " IS NOT NULL";
    }

    function makeGenerate(comparator, options) {
        options || (options = {});
        _.defaults(options, {
            inputPrefix: "",
            inputSuffix: ""
        })
        return function(columnName, inputValue) {
            return inputValue ?
                columnName + " " + comparator + " " + qs(options.inputPrefix + inputValue + options.inputSuffix) :
                "";
        }
    }

    // quote single
    function qs(string) {
        return "'" + chorus.Mixins.dbHelpers.sqlEscapeString(string) + "'";
    }
})();

