chorus.views.DatasetFilter = chorus.views.Base.extend({
    className: "dataset_filter",
    tagName: "li",
    persistent: true,

    subviews: {
        '.column_filter': 'columnFilter'
    },

    events: {
        "click .remove": "removeSelf",
        "change select.comparator": "comparatorSelected",
        "paste input.validatable": "validateInput",
        "keyup input.validatable": "validateInput",
        "blur input.validatable": "validateInput"
    },

    setup: function() {
        this.columnFilter = new chorus.views.ColumnSelect({
            collection: this.collection,
            showAliasedName: this.options.showAliasedName,
            disableOtherTypeCategory: false
        });
        this.bindings.add(this.columnFilter, "columnSelected", this.columnSelected);
    },

    postRender: function() {
        chorus.datePicker({
            "%Y": this.$(".filter.date input[name='year']"),
            "%m": this.$(".filter.date input[name='month']"),
            "%d": this.$(".filter.date input[name='day']")
        });

        if (!this.collection.length) {
            return;
        }

        this.columnSelected();
        this.comparatorSelected();
    },

    removeSelf: function(e) {
        e && e.preventDefault();
        this.trigger("filterview:deleted", this);
    },

    columnSelected: function() {
        var type = this.columnFilter.getSelectedColumn().get('typeCategory');

        var $comparator = this.$("select.comparator");
        $comparator.empty();

        switch (type) {
            case "STRING":
            case "LONG_STRING":
                this.map = new chorus.models.DatasetFilterMaps.String
                break;
            case "BOOLEAN":
                this.map = new chorus.models.DatasetFilterMaps.Boolean
                break;
            case "WHOLE_NUMBER":
            case "REAL_NUMBER":
                this.map = new chorus.models.DatasetFilterMaps.Numeric
                break;
            case "DATE":
                this.map = new chorus.models.DatasetFilterMaps.Date
                break;
            case "TIME":
                this.map = new chorus.models.DatasetFilterMaps.Time
                break;
            case "DATETIME":
                this.map = new chorus.models.DatasetFilterMaps.Timestamp
                break;
            default:
                this.map = new chorus.models.DatasetFilterMaps.Other
                break;
        }

        if (!this.map) { return; }

        _.each(this.map.comparators, function(value, key) {
            var el = $("<option/>").text(t("dataset.filter." + key)).attr("value", key);
            $comparator.append(el);
        });

        _.defer(function() {
            chorus.styleSelect($comparator, { menuWidth: 240 })
        });

        this.comparatorSelected();
    },

    comparatorSelected: function() {
        var comparatorName = this.$("select.comparator option:selected").val();
        if (!this.map) { return; }

        var comparator = this.map.comparators[comparatorName];
        this.$(".filter.default").toggleClass("hidden", !comparator.usesInput);
        this.$(".filter.time").toggleClass("hidden", !comparator.usesTimeInput);
        this.$(".filter.date").toggleClass("hidden", !comparator.usesDateInput);

        this.validateInput();
    },

    filterString: function() {
        var columnName = this.columnFilter.getSelectedColumn().quotedName();
        var comparatorName = this.$("select.comparator").val();
        var inputValue = this.fieldValues().value;

        return this.map.comparators[comparatorName].generate(columnName, inputValue);
    },

    fieldValues: function() {
        switch (this.map.type) {
            case "Time":
                return { value: this.$(".filter.time input").val() };
                break;
            case "Date":
                var year = this.$(".filter.date input[name='year']").val(),
                    month = this.$(".filter.date input[name='month']").val(),
                    day = this.$(".filter.date input[name='day']").val();
                return {
                    year: year,
                    month: month,
                    day: day,
                    value: ((year + month + day).length > 0) ? [year, month, day].join("/") : ""
                };
                break;
            default:
                return { value: this.$(".filter.default input").val() };
                break;
        }
    },

    validateInput: function() {
        if (!this.map) { return; }
        if (this.map.performValidation(this.fieldValues())) {
            this.clearErrors();
        } else {
            this.showErrors(this.map);
        }
    },

    valid: function() {
        return this.columnFilter.valid();
    },

    serialize: function() {
        var type = this.columnFilter.getSelectedColumn().get('typeCategory')
        var value = type == "DATE" ?
            _.map(this.$(".filter.date input"), function(input){return $(input).val()}) :
            this.$(".filter input").val()

        var model = new chorus.models.TabularDataFilter({
            column: this.columnFilter.getSelectedColumn().get("name"),
            comparator: this.$("select.comparator option:selected").val(),
            value: value
        });

        return model;
    }
});
