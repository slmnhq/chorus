chorus.views.DatasetVisualizationSidebar = chorus.views.Sidebar.extend({
    className:"dataset_visualization_sidebar",

    setup: function() {
        this.collection.comparator = function(column) { return column.get("name").toLowerCase(); }
        this.collection.sort();

        this.numericalColumns = _.filter(this.collection.models, function(col) {
                var category = col.get('typeCategory')
                var allowedCategories = ['WHOLE_NUMBER', 'REAL_NUMBER']
                return _.include(allowedCategories, category)
        });
    },

    postRender: function() {
        this.$(".category option:eq(1)").attr('selected', 'selected');
        chorus.styleSelect(this.$('select'));
        var createButton = this.$("button.create");
        if (createButton) {
            createButton.focus();
        }
    },

    additionalContext: function() {
        return {
            numericalColumns : _.map(this.numericalColumns, function(col) {
                return {
                    name: col.get('name'),
                    typeCategory: col.get('typeCategory')
                }
            })
        }
    }
});