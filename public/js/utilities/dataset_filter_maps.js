(function(){
    chorus.utilities.DatasetFilterMaps = {};

    chorus.utilities.DatasetFilterMaps.string = {
        comparators: {
            "equal":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " = " + qs(inputValue) : "";
            }},
            "not_equal":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " != " + qs(inputValue) : "";
            }},
            "null":{usesInput:false, generate:function (columnName, inputValue) {
                return qd(columnName) + " IS NULL";
            }},
            "not_null":{usesInput:false, generate:function (columnName, inputValue) {
                return qd(columnName) + " IS NOT NULL";
            }},
            "like":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " LIKE " + qs(inputValue) : "";
            }},
            "begin_with":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " = " + qs(inputValue + '%') : "";
            }},
            "end_with":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " = " + qs('%' + inputValue) : "";
            }},
            "alpha_after":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " > " + qs(inputValue) : "";
            }},
            "alpha_after_equal":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " >= " + qs(inputValue) : "";
            }},
            "alpha_before":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " < " + qs(inputValue) : "";
            }},
            "alpha_before_equal":{usesInput:true, generate:function (columnName, inputValue) {
                return inputValue ? qd(columnName) + " <= " + qs(inputValue) : "";
            }}
        },
        validate: function(value) {
            return true
        }
    };

    chorus.utilities.DatasetFilterMaps.numeric = {
        comparators: {
            "equal": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " = " + qs(inputValue) : "";
            }},
            "not_equal": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " != " + qs(inputValue) : "";
            }},
            "null": {usesInput: false, generate: function(columnName, inputValue) {
                return qd(columnName) + " IS NULL";
            }},
            "not_null": {usesInput: false, generate: function(columnName, inputValue) {
                return qd(columnName) + " IS NOT NULL";
            }},
            "greater": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " > " + qs(inputValue) : "";
            }},
            "greater_equal": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " >= " + qs(inputValue) : "";
            }},
            "less": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " < " + qs(inputValue) : "";
            }},
            "less_equal": {usesInput: true, generate: function(columnName, inputValue) {
                return inputValue ? qd(columnName) + " <= " + qs(inputValue) : "";
            }}
        },
        validate: function(value) {
            return value.match(/^[0-9,.]*$/);
        }
    };

    // quote double
    function qd(string) {
        return '"' + string + '"';
    }

    // quote single
    function qs(string) {
        return "'" + string + "'";
    }
})();

