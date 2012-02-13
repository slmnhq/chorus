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
        var self = this;
        _.defer(function () {
            chorus.styleSelect($select);
            chorus.datePicker({
                "%Y": self.$(".filter.date input.year"),
                "%m": self.$(".filter.date input.month"),
                "%d": self.$(".filter.date input.day")
            });
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

        var comparatorClasses = "string date numeric time";
        switch (type) {
            case "STRING":
            case "LONG_STRING":
                $comparator.removeClass(comparatorClasses).addClass("string");
                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                $comparator.removeClass(comparatorClasses).addClass("numeric");
                break;
            case "DATE":
                $comparator.removeClass(comparatorClasses).addClass("date");
                break;
            case "TIME":
                $comparator.removeClass(comparatorClasses).addClass("time");
                break;
        }

        this.model = this.makeMap();
        if (!this.model) {
            return;
        }

        _.each(this.model.comparators, function(value, key) {
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

        if (!this.model) {
            return;
        }

        var comparator = this.model.comparators[$choice.val()];
        this.$(".filter.default").toggleClass("hidden", !comparator.usesInput);
        this.$(".filter.time").toggleClass("hidden", !comparator.usesTimeInput);
        this.$(".filter.date").toggleClass("hidden", !comparator.usesDateInput);

        this.validateInput();
    },

    makeMap: function() {
        var $comparator = this.$("select.comparator");

        if ($comparator.is(".string")) {
            return new chorus.models.DatasetFilterMaps.String
        } else if ($comparator.is(".numeric")) {
            return new chorus.models.DatasetFilterMaps.Numeric
        } else if ($comparator.is(".time")) {
            return new chorus.models.DatasetFilterMaps.Time
        } else if ($comparator.is(".date")) {
            return new chorus.models.DatasetFilterMaps.Date
        }
    },

    filterString : function() {
        var columnName = this.$("select.column_filter").val();
        var $comparator = this.$("select.comparator");
        var $input = this.getInputField();

        return this.model.comparators[$comparator.val()].generate(columnName,  $input.val());
    },

    getInputField : function() {
        var maps = chorus.models.DatasetFilterMaps;
        if (this.model.type === "String" || this.model.type === "Numeric") {
            return this.$(".filter.default input");
        } else if (this.model.type === "Time") {
            return this.$(".filter.time input");
        } else if (this.model.type === "Date") {
            return this.$(".filter.date input.year");
        }
    },

    validateInput : function() {
        var $input = this.getInputField()
        var value = $input.val()

        if (!this.model) {
            return;
        }

        if (this.model.performValidation({ value: value })) {
            this.clearErrors();
        } else {
            this.markInputAsInvalid($input, t(this.model.errorMessage), false)
        }
    }
});
