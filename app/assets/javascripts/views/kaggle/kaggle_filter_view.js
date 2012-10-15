chorus.views.KaggleFilter = chorus.views.Base.extend({
    templateName: "kaggle_filter",
    tagName: 'li',

    //TODO: merge KaggleFilter and DatasetFilter views functionality for common ancestors
    events: {
        'click .remove': 'removeSelf'
    },

    subviews: {
        '.column_filter': 'columnFilter'
    },

    setup: function() {
        this.collection = new chorus.collections.KaggleColumnSet();

        this.collection.each(function(model) {
            model.quotedName = function() {
                return  this.get("name");
            }
        }, this);
        this.columnFilter = new chorus.views.ColumnSelect({
            collection: this.collection,
            showAliasedName: false,
            disableOtherTypeCategory: false
        });
        this.bindings.add(this.columnFilter, "columnSelected", this.columnSelected);

    },

    removeSelf: function(e) {
        e && e.preventDefault();
        this.trigger("deleted");
    }
})