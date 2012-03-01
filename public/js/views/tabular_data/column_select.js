chorus.views.ColumnSelect = chorus.views.Base.extend({
    className: "column_select",

    events: {
        "change select": "columnSelected"
    },

    postRender: function() {
        var self = this;
        _.defer(function() {
            chorus.styleSelect(self.$('select'), {format: function(text, option) {
                var aliasedName = $(option).data('aliasedName');
                if (aliasedName && self.options.showAliasedName) {
                    return '<span class="aliased_name"><span class="letter">' + aliasedName + '</span></span>' + text;
                } else {
                    return text;
                }
            } });
        });
    },

    collectionModelContext: function(model) {
        return {
            quotedName: model.quotedName(),
            disable: model.get("typeCategory") == "OTHER" && this.options.disableOtherTypeCategory,
            selected: model == this.selectedColumn
        }
    },

    getSelectedColumn: function() {
        var selectedCid = this.$('select option:selected').data('cid')
        return this.collection.getByCid(selectedCid)
    },

    columnSelected: function() {
        this.selectedColumn = this.getSelectedColumn()
        this.trigger("columnSelected", this.selectedColumn)
    },

    valid: function() {
        if(!this.selectedColumn) {
            return true;
        }
        return this.collection.include(this.selectedColumn);
    }
})
