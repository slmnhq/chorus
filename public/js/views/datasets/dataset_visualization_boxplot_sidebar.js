chorus.views.DatasetVisualizationBoxplotSidebar = chorus.views.Sidebar.extend({
    className: "dataset_visualization_boxplot_sidebar",
    additionalClass: "dataset_visualization_sidebar",

    setup: function() {
        var alphaSort = function(column) {
            return column.get("name") && column.get("name").toLowerCase();
        }

        this.numericalColumns = _.filter(this.collection.models, function(col) {
            var category = col.get('typeCategory')
            var allowedCategories = ['WHOLE_NUMBER', 'REAL_NUMBER']
            return _.include(allowedCategories, category)
        });

        this.numericalColumns = _.sortBy(this.numericalColumns, alphaSort);
        this.allColumns = _.sortBy(this.collection.models, alphaSort);
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
            chartType: "boxplot",            
            numericalColumns: _.map(this.numericalColumns, function(col) {
                return {
                    name: col.get('name'),
                    typeCategory: col.get('typeCategory')
                }
            }),
            allColumns: _.map(this.allColumns, function(col) {
                return {
                    name: col.get('name'),
                    typeCategory: col.get('typeCategory')
                }
            })
        }
    }
});