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

chorus.views.DatasetFilter.stringMap = {
    "equal":{usesInput: true},
    "not_equal":{usesInput: true},
    "null":{usesInput: false},
    "not_null":{usesInput: false},
    "like":{usesInput: true},
    "begin_with":{usesInput: true},
    "end_with":{usesInput: true},
    "alpha_after":{usesInput: true},
    "alpha_after_equal":{usesInput: true},
    "alpha_before":{usesInput: true},
    "alpha_before_equal":{usesInput: true}
};