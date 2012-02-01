chorus.views.DatasetFilter = chorus.views.Base.extend({
    className: "dataset_filter",
    events : {
        "click .add_filter" : "addFilter"
    },

    postRender: function() {
        var selects = this.$("select.column_filter");
        _.defer(function(){chorus.styleSelect(selects)});
    },

    addFilter : function(e) {
        e && e.preventDefault();
        this.$(".filters").append('<li class="filter"></li>');
    }
});