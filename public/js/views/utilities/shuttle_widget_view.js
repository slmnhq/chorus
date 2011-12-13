;(function($, ns) {
    ns.views.ShuttleWidget = ns.views.Base.extend({
        className : "shuttle_widget",

        events : {
            "click a.add" : "toggleAdd",
            "click a.remove" : "toggleAdd",
            "click a.add_all" : "addAll",
            "click a.remove_all" : "removeAll"
        },

        setup : function() {
            this.selectionSource = this.options.selectionSource;
            this.selectionSource.bind("reset", this.render);
        },

        collectionModelContext : function(model) {
            var ctx = {};
            var selections = this.selectionSource.map(function(item) { return item.get("id")});
            ctx.isAdded = _.include(selections, model.get("id"));
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
        },

        addAll : function(e) {
            e.preventDefault();
            this.$("li").addClass("added");
        },

        removeAll : function(e) {
            e.preventDefault();

            this.$("li").removeClass("added");
        }
    })
})(jQuery, chorus);