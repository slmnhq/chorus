chorus.views.DatasetVisualizationSidebar = chorus.views.Sidebar.extend({
    additionalClass: "dataset_visualization_sidebar",

    events: {
        "click button.create": "launchVisualizationDialog"
    },

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
    },

    launchVisualizationDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.Visualization({model: this.model, chartOptions: this.chartOptions()});
        dialog.launchModal();
    }
});