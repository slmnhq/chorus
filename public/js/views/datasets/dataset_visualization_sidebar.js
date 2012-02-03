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

        this.dateTimeColumns = _.filter(this.columns, function(col) {
            var category = col.get('typeCategory')
            var allowedCategories = ['DATE', 'TIME', "DATETIME"]
            return _.include(allowedCategories, category)
        });
    },

    postRender: function() {
        chorus.styleSelect(this.$('select'));

        var $a = this.$(".limiter a");
        var $el = $(this.el);
        var limiterSelected = _.bind(this.limiterSelected, this);
        $.each($a, function(index,link) {
            var $link = $(link);
            chorus.menu($link, {
                content: $link.parent().find(".limiter_menu_container").html(),
                container: $el,
                contentEvents: {
                    'li': limiterSelected
                }
            })
        })
    },

    limiterSelected: function(e, api) {
        api.elements.target.find('.selected_value').text($(e.target).text());
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

    datetimeColumns: function() {
        return _.map(this.dateTimeColumns, function(col) {
            return col.get('name');
        });
    },

    launchVisualizationDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.Visualization({model: this.model, chartOptions: this.chartOptions()});
        dialog.launchModal();
    }
});