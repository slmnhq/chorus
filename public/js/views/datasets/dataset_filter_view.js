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
        var $select = this.$("select.column_filter");
        _.defer(function () {
            chorus.styleSelect($select);
        });

        if (!$select.find("option").length) {
            return;
        }

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
                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                $comparator.addClass("numeric").removeClass("string");
                break;
        }

        var map = this.getMap();
        if (!map) {
            return;
        }

        _.each(map.comparators, function(value, key) {
            var el = $("<option/>").text(t("dataset.filter." + key)).addClass("map_" + key).attr("value", key);
            $comparator.append(el);
        });

        _.defer(function () {
            chorus.styleSelect($comparator)
        });

        this.comparatorSelected();
    },

    comparatorSelected:function () {
        var $comparator = this.$("select.comparator");
        var $choice = $comparator.find("option:selected");
        var $input = this.$(".filter_input");

        var map = this.getMap();
        if (!map) {
            return;
        }

        _.each(map.comparators, function (value, key) {
            if ($choice.hasClass("map_" + key)) {
                $input.toggleClass("hidden", !value.usesInput);
            }
        });

        this.validateInput();
    },

    getMap: function() {
        var $comparator = this.$("select.comparator");

        if ($comparator.is(".string")) {
            return chorus.utilities.DatasetFilterMaps.string
        } else if ($comparator.is(".numeric")) {
            return chorus.utilities.DatasetFilterMaps.numeric
        }
    },

    filterString : function() {
        var columnName = this.$("select.column_filter").val();
        var $comparator = this.$("select.comparator");
        var $input = this.$(".filter_input");
        
        var map = this.getMap();
        return map.comparators[$comparator.val()].generate(columnName,  $input.val());
    },

    validateInput : function() {
        var $input = this.$('.filter_input')
        var value = $input.val()

        var map = this.getMap();
        if (!map) {
            return;
        }

        if (map.validate(value)) {
            this.clearErrors();
        } else {
            this.markInputAsInvalid($input, "Please enter only numbers, dots or commas [0-9,.]", false)
        }
    }
});