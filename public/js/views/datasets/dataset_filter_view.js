chorus.views.DatasetFilter = chorus.views.Base.extend({
    className: "dataset_filter",
    tagName: "li",

    events : {
        "click .remove" : "removeSelf"
    },

    postRender: function() {
        var select = this.$("select.column_filter");
        _.defer(function(){chorus.styleSelect(select)});
    },

    collectionModelContext : function(model) {
        return {
            disable: model.get("typeCategory") == "OTHER"
        }
    },

    removeSelf : function(e) {
        e && e.preventDefault();
        this.trigger("filterview:deleted", this);
    }
});