(function(){
    chorus.utilities.DatasetFilterMaps = {};

    chorus.utilities.DatasetFilterMaps.string = {
        comparators: {
            "equal":{usesInput:true, generate: makeGenerate("=") },
            "not_equal":{usesInput:true, generate: makeGenerate("!=") },
            "null":{usesInput:false, generate:isNull },
            "not_null":{usesInput:false, generate:isNotNull },
            "like":{usesInput:true, generate: makeGenerate("LIKE") },
            "begin_with":{usesInput:true, generate:makeGenerate("=", {inputSuffix: '%'}) },
            "end_with":{usesInput:true, generate:makeGenerate("=", {inputPrefix: '%'}) },
            "alpha_after":{usesInput:true, generate:makeGenerate(">") },
            "alpha_after_equal":{usesInput:true, generate:makeGenerate(">=") },
            "alpha_before":{usesInput:true, generate:makeGenerate("<") },
            "alpha_before_equal":{usesInput:true, generate:makeGenerate("<=") }
        },
        validate: function(value) {
            return true
        }
    };

    chorus.utilities.DatasetFilterMaps.numeric = {
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
        validate: function(value) {
            return value.match(/^[0-9,.]*$/);
        },
        errorMessage: "dataset.filter.number_required"
    };

    chorus.utilities.DatasetFilterMaps.time = {
        comparators: {
            "equal": {usesTimeInput: true, generate: makeGenerate("=") },
            "before": {usesTimeInput: true, generate: makeGenerate("<") },
            "after": {usesTimeInput: true, generate: makeGenerate(">") },
            "null": {usesTimeInput: false, generate: isNull },
            "not_null": {usesTimeInput: false, generate: isNotNull }
        },
        validate: function(value) {
            return value.match(/^[0-9:]*$/);
        },
        errorMessage: "dataset.filter.time_required"
    };

    chorus.utilities.DatasetFilterMaps.date = {
        comparators: {
            "on": {usesDateInput: true, generate: makeGenerate("=") },
            "before": {usesDateInput: true, generate: makeGenerate("<") },
            "after": {usesDateInput: true, generate: makeGenerate(">") },
            "null": {usesDateInput: false, generate: isNull },
            "not_null": {usesDateInput: false, generate: isNotNull }
        },
        validate: function(value) {
            return true
        }
    };

    function isNull(columnName, inputValue){
        return qd(columnName) + " IS NULL";
    }

    function isNotNull(columnName, inputValue){
        return qd(columnName) + " IS NOT NULL";
    }

    function makeGenerate(comparator, options) {
        options || (options = {});
        _.defaults(options, {
            inputPrefix: "",
            inputSuffix: ""
        })
        return function(columnName, inputValue) {
            return inputValue ?
                qd(columnName) + " " + comparator + " " + qs(options.inputPrefix + inputValue + options.inputSuffix) :
                "";
        }
    }

    // quote double
    function qd(string) {
        return '"' + string + '"';
    }

    // quote single
    function qs(string) {
        return "'" + string + "'";
    }
})();

