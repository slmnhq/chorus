;
(function() {
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

            this.numericalColumns = filterColumns(['WHOLE_NUMBER', 'REAL_NUMBER'], this.columns)
            this.datetimeColumns = filterColumns(['DATE', 'TIME', "DATETIME"], this.columns);

            function filterColumns(types, columns) {
                return _.filter(columns, function(col) {
                    var category = col.get('typeCategory')
                    return _.include(types, category)
                })
            }
        },

        postRender: function() {
            chorus.styleSelect(this.$('select'));

            var $a = this.$(".limiter a");
            var $el = $(this.el);
            var limiterSelected = _.bind(this.limiterSelected, this);
            $.each($a, function(index, link) {
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

        allColumnNames: nameGetter("columns"),
        numericColumnNames: nameGetter("numericalColumns"),
        datetimeColumnNames: nameGetter("datetimeColumns"),

        launchVisualizationDialog: function(e) {
            e && e.preventDefault();

            var dialog = new chorus.dialogs.Visualization({model: this.model, chartOptions: this.chartOptions(), filters: this.filters });
            this.dialog = dialog
            var func = 'make' + _.capitalize(this.chartOptions().type) + 'Task';
            this.task = dialog.task = this.model[func](this.chartOptions());
            dialog.task.set({filters: this.filters && this.filters.whereClause()});
            dialog.task.bindOnce("saved", dialog.onExecutionComplete, dialog);
            dialog.task.bindOnce("saveFailed", this.onSqlError, this)
            dialog.task.save();
        },

        onSqlError: function() {
            this.errorContainer.task = this.task;
            this.errorContainer.$(".sql_errors").removeClass("hidden");
        }
    });

    function nameGetter(prop) {
        return function() {
            return _.map(this[prop], function(col) {
                return col.get('name');
            });
        }
    }
})();