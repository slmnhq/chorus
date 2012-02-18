chorus.views.ColumnSelect = chorus.views.Base.extend({
    className: "column_select",

    events: {
        "change select": "columnSelected"
    },

    postRender: function() {
        var self = this;
        _.defer(function() {
            chorus.styleSelect(self.$('select'), {format: function(text, option) {
                var datasetNumber = $(option).data('datasetNumber');
                if (datasetNumber && self.options.showDatasetNumbers) {
                    return '<span class="dataset_number">' + datasetNumber + '</span>' + text;
                } else {
                    return text;
                }
            } });
        });
    },

    collectionModelContext: function(model) {
        return {
            quotedName: model.quotedName(),
            disable: model.get("typeCategory") == "OTHER" && this.options.disableOtherTypeCategory
        }
    },

    getSelectedColumn: function() {
        var selectedCid = this.$('select option:selected').data('cid')
        return this.collection.getByCid(selectedCid)
    },

    columnSelected: function() {
        this.trigger("columnSelected", this.getSelectedColumn())
    }
})
