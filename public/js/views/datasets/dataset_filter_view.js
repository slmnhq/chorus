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
                "%Y": self.$(".filter.date input[name='year']"),
                "%m": self.$(".filter.date input[name='month']"),
                "%d": self.$(".filter.date input[name='day']")
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
        var inputValue = this.fieldValues().value;

        return this.model.comparators[$comparator.val()].generate(columnName, inputValue);
    },

    fieldValues: function() {
        switch (this.model.type) {
            case "Time":
                return { value: this.$(".filter.time input").val() };
                break;
            case "Date":
                var year  = this.$(".filter.date input[name='year']").val(),
                    month = this.$(".filter.date input[name='month']").val(),
                    day   = this.$(".filter.date input[name='day']").val();
                return {
                    year: year,
                    month: month,
                    day: day,
                    value: ((year + month + day).length > 0) ? [year, month, day].join("/") : ""
                };
                break;
            case "Numeric":
            case "String":
                return { value: this.$(".filter.default input").val() };
                break;
        }
    },

    validateInput : function() {
        if (!this.model) { return; }
        if (this.model.performValidation(this.fieldValues())) {
            this.clearErrors();
        } else {
            this.showErrors(this.model);
        }
    }
});
