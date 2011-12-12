;(function($, ns) {
    ns.views.ShuttleWidget = ns.views.Base.extend({
        className : "shuttle_widget",

        events : {
            "click a.add" : "toggleAdd",
            "click a.remove" : "toggleAdd"
        },

        collectionModelContext : function(model) {
            var ctx = {};
            ctx.isAdded = _.include(this.options.selectedIDs, model.get("id"));
            ctx.displayName = model.displayName();
            ctx.imageUrl = model.imageUrl();

            return ctx;
        },

        toggleAdd : function(e) {
            e.preventDefault();

            var target = this.$(e.currentTarget);
            var id = target.closest("li").data("id");
            var isAdding = target.closest("ul").hasClass("available");

            this.$("li[data-id='" + id + "']").toggleClass("added", isAdding);
        },

        getSelectedIDs : function() {
            var selectedItems = this.$('ul.selected li.added');
            return _.map(selectedItems, function(item) {
                return $(item).data("id").toString();
            });
        }
    })
})(jQuery, chorus);