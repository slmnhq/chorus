chorus.views.DatasetFilter = chorus.views.Base.extend({
    className:"dataset_filter",
    tagName:"li",

    events:{
        "click .remove":"removeSelf",
        "change select.column_filter":"columnSelected",
        "change select.comparator":"comparatorSelected"
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
                $comparator.addClass("string");
                _.each(chorus.views.DatasetFilter.stringMap, function (value, key) {
                    var el = $("<option/>").text(t("dataset.filter." + key)).addClass("map_" + key).attr("value", key);
                    $comparator.append(el);
                });

                break;
        }

        _.defer(function () {
            chorus.styleSelect($comparator)
        });
    },

    comparatorSelected:function () {
        var $comparator = this.$("select.comparator");
        var $choice = $comparator.find("option:selected");
        var $input = this.$(".filter_input");

        if ($comparator.is(".string")) {
            _.each(chorus.views.DatasetFilter.stringMap, function (value, key) {
                if ($choice.hasClass("map_" + key)) {
                    $input.toggleClass("hidden", !value.usesInput);
                }
            });
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
        }}
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