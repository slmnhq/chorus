chorus.views.DatasetFilter = chorus.views.Base.extend({
    className:"dataset_filter",
    tagName:"li",

    events:{
        "click .remove":"removeSelf",
        "change select.column_filter":"columnSelected",
        "change select.comparator":"comparatorSelected",
        "paste input.filter_input":"validateInput",
        "keyup input.filter_input":"validateInput"
    },

    postRender:function () {
        var select = this.$("select.column_filter");
        _.defer(function () {
            chorus.styleSelect(select)
        });

        this.columnSelected();
        this.comparatorSelected();
    },

    collectionModelContext:function (model) {
        return {
            disable:model.get("typeCategory") == "OTHER"
        }
    },

    removeSelf:function (e) {
        e && e.preventDefault();
        this.trigger("filterview:deleted", this);
    },

    columnSelected:function () {
        var selected = this.$("select.column_filter option:selected");
        var type = selected.data("typeCategory");

        var $comparator = this.$("select.comparator");
        $comparator.empty();

        switch (type) {
            case "STRING":
            case "LONG_STRING":
                $comparator.addClass("string").removeClass("numeric");
                _.each(chorus.views.DatasetFilter.stringMap, function (value, key) {
                    var el = $("<option/>").text(t("dataset.filter." + key)).addClass("map_" + key).attr("value", key);
                    $comparator.append(el);
                });

                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                $comparator.addClass("numeric").removeClass("string");
                _.each(chorus.views.DatasetFilter.numericMap, function(value, key) {
                    var el = $("<option/>").text(t("dataset.filter." + key)).addClass("map_" + key).attr("value", key);
                    $comparator.append(el);
                });
                break;
        }

        _.defer(function () {
            chorus.styleSelect($comparator)
        });

        this.comparatorSelected();
    },

    comparatorSelected:function () {
        var $comparator = this.$("select.comparator");
        var $choice = $comparator.find("option:selected");
        var $input = this.$(".filter_input");

        _.each(this.getMap(), function (value, key) {
            if ($choice.hasClass("map_" + key)) {
                $input.toggleClass("hidden", !value.usesInput);
            }
        });

        this.validateInput();
    },

    getMap: function() {
        var $comparator = this.$("select.comparator");

        if ($comparator.is(".string")) {
            return chorus.views.DatasetFilter.stringMap
        } else if ($comparator.is(".numeric")) {
            return chorus.views.DatasetFilter.numericMap
        }
    },

    filterString : function() {
        var columnName = this.$("select.column_filter").val();
        var $comparator = this.$("select.comparator");
        var $input = this.$(".filter_input");

        if ($comparator.is(".string")) {
            return chorus.views.DatasetFilter.stringMap[$comparator.val()].generate(columnName, $input.val())
        } else if ($comparator.is(".numeric")) {
            return chorus.views.DatasetFilter.numericMap[$comparator.val()].generate(columnName, $input.val())
        }
    },

    validateInput : function() {
        var $input = this.$('.filter_input')
        var value = $input.val()

        if(this.getMap().validate(value)) {
            this.clearErrors();
        } else {
            this.markInputAsInvalid($input, "Please enter only numbers, dots or commas [0-9,.]", false)
        }
    }
});

(function(){
    chorus.views.DatasetFilter.stringMap = {
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
        }},
        validate: function(value) {
            return true
        }
    };

    chorus.views.DatasetFilter.numericMap = {
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
        }},
        validate: function(value) {
            return value.match(/^[0-9,.]+$/);
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

