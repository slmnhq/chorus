chorus.views.DatasetFilter = chorus.views.Base.extend({
    className: "dataset_filter",

    postRender: function() {
        var select = this.$("select.column_filter");
        _.defer(function(){chorus.styleSelect(select)});
    }
});