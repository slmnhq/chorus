chorus.views.DatasetFilter = chorus.views.Base.extend({
    className:"dataset_filter",
    tagName:"li",

    events:{
        "click .remove":"removeSelf",
        "change select.column_filter":"columnSelected",
        "change select.comparator":"comparatorSelected",
        "paste input.validatable":"validateInput",
        "keyup input.validatable":"validateInput"
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
                $comparator.addClass("string").removeClass("numeric time");
                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                $comparator.addClass("numeric").removeClass("string time");
                break;
            case "TIME":
                $comparator.addClass("time").removeClass("numeric string");
                break;
        }

        var map = this.getMap();
        if (!map) {
            return;
        }

        _.each(map.comparators, function(value, key) {
            var el = $("<option/>").text(t("dataset.filter." + key)).attr("value", key);
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

        var map = this.getMap();
        if (!map) {
            return;
        }

        var comparator = map.comparators[$choice.val()];
        this.$(".filter_input").toggleClass("hidden", !comparator.usesInput);
        this.$(".time_input").toggleClass("hidden", !comparator.usesTimeInput);

        this.validateInput();
    },

    getMap: function() {
        var $comparator = this.$("select.comparator");

        if ($comparator.is(".string")) {
            return chorus.utilities.DatasetFilterMaps.string
        } else if ($comparator.is(".numeric")) {
            return chorus.utilities.DatasetFilterMaps.numeric
        } else if ($comparator.is(".time")) {
            return chorus.utilities.DatasetFilterMaps.time
        } else if ($comparator.is(".date")) {
            return chorus.utilities.DatasetFilterMaps.date
        }
    },

    filterString : function() {
        var columnName = this.$("select.column_filter").val();
        var $comparator = this.$("select.comparator");
        var $input = this.getInputField();
        
        var map = this.getMap();
        return map.comparators[$comparator.val()].generate(columnName,  $input.val());
    },

    getInputField : function() {
        var map = this.getMap();
        var maps = chorus.utilities.DatasetFilterMaps;
        if (map == maps.string || map == maps.numeric) {
            return this.$(".filter_input");
        } else if (map == maps.time) {
            return this.$(".time_input");
        }
    },

    validateInput : function() {
        var $input = this.getInputField()
        var value = $input.val()

        var map = this.getMap();
        if (!map) {
            return;
        }

        if (map.validate(value)) {
            this.clearErrors();
        } else {
            this.markInputAsInvalid($input, t(map.errorMessage), false)
        }
    }
});