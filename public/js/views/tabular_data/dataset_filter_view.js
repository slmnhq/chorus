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
        "paste input.validatable": "updateInput",
        "keyup input.validatable": "updateInput",
        "blur input.validatable": "updateInput"
    },

    setup: function() {
        this.model = this.model || new chorus.models.TabularDataFilter();
        this.columnFilter = new chorus.views.ColumnSelect({
            collection: this.collection,
            showAliasedName: this.options.showAliasedName,
            disableOtherTypeCategory: false
        });
        this.bindings.add(this.columnFilter, "columnSelected", this.columnSelected);
        this.bindings.add(this.collection, "remove", this.render);
        this.bindings.add(this.model, "change", this.render);
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

        this.columnFilter.selectColumn(this.model.get("column"));
    },

    removeSelf: function(e) {
        e && e.preventDefault();
        this.trigger("deleted");
    },

    columnSelected: function() {
        var selectedColumn = this.columnFilter.getSelectedColumn();
        this.model.setColumn(selectedColumn);

        var $comparator = this.$("select.comparator");
        $comparator.empty();

        this.map = this.model.getFilterMap();

        _.each(this.map.comparators, function(value, key) {
            var el = $("<option/>").text(t("dataset.filter." + key)).attr("value", key);
            $comparator.append(el);
        });

        _.defer(function() {
            chorus.styleSelect($comparator, { menuWidth: 240 })
        });

        this.selectComparator();
    },

    selectComparator: function() {
        var name = this.model.get("comparator");
        if (name) {
            this.$("select.comparator option[value=" + name + "]").prop('selected', true).change();
        } else {
            this.$("select.comparator option:eq(0)").prop('selected', true).change();
        }
        this.$("select.comparator").selectmenu();
    },

    comparatorSelected: function() {
        var comparatorName = this.$("select.comparator option:selected").val();
        this.model.set({comparator: comparatorName}, {silent: true});
        if (!this.map) { return; }

        var comparator = this.map.comparators[comparatorName];
        this.$(".filter.default").toggleClass("hidden", !comparator.usesInput);
        this.$(".filter.time").toggleClass("hidden", !comparator.usesTimeInput);
        this.$(".filter.date").toggleClass("hidden", !comparator.usesDateInput);

        this.fillInput();
        this.validateInput();
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

    fillInput: function() {
        var comparator = this.map.comparators[this.model.get("comparator")];
        var inputs = this.filtersForComparator(comparator);
        var input = this.model.get("input")
        if (!input || _.isEmpty(inputs)) {return;}

        if (this.model.get("column").get("typeCategory") == "DATE") {
            _.each(['day', 'month', 'year'], function(word) {
                var dateInput = _.find(inputs, function(i) {
                    return $(i).find('input[name=' + word + ']')
                });
                $(dateInput).find('input[name=' + word + ']').val(input[word]);
            })
        } else {
            inputs.eq(0).find("input").val(input.value);
        }
    },

    updateInput: function() {
        this.model.set({input: this.fieldValues()}, {silent: true});
        this.validateInput();
    },

    valid: function() {
        return this.columnFilter.valid();
    },


    filtersForComparator: function(comparator) {
        if (comparator.usesInput) {
            return this.$('.filter.default');
        }
        if (comparator.usesTimeInput) {
            return this.$('.filter.time');
        }
        if (comparator.usesDateInput) {
            return this.$('.filter.date');
        }
    }
});
