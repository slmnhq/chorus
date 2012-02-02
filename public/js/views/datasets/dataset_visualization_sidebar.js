chorus.views.DatasetVisualizationSidebar = chorus.views.Sidebar.extend({
    additionalClass: "dataset_visualization_sidebar",

    setup: function() {
        var alphaSort = function(column) {
            return column.get("name") && column.get("name").toLowerCase();
        }
        this.columns = _.sortBy(this.collection.models, alphaSort);

        this.numericalColumns = _.filter(this.columns, function(col) {
            var category = col.get('typeCategory')
            var allowedCategories = ['WHOLE_NUMBER', 'REAL_NUMBER']
            return _.include(allowedCategories, category)
        });
    },

    postRender: function() {
        chorus.styleSelect(this.$('select'));

        chorus.menu(this.$(".category_limit a"), {
            content: this.$(".category_limit_menu_container").html(),
            contentEvents: {
                'li': _.bind(this.categoryLimitSelected, this)
            }
        });
    },

    categoryLimitSelected: function(e) {
        this.$('.category_limit a .selected_value').text($(e.target).text());
    },

    allColumns: function() {
        return _.map(this.columns, function(col) {
            return col.get('name');
        });
    },

    numericColumns: function() {
        return _.map(this.numericalColumns, function(col) {
            return col.get('name');
        });
    }
});