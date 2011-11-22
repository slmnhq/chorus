(function($, ns) {
    ns.WorkspaceList = chorus.views.Base.extend({
        className : "workspace_list",
        tagName : "ul",

        collectionModelContext: function(model) {
            return {
                imageUrl: model.defaultIconUrl(),
                showUrl: model.showUrl(),
                ownerUrl: model.owner().showUrl()
            };
        },

        postRender: function() {
            this.applyFilter();
        },

        setFilter: function(filterType) {
            this.filter = filterType;
            this.applyFilter();
        },

        applyFilter: function() {
            if (this.filter == 'active') {
                this.filterActive();
            } else {
                this.filterAll();
            }
        },

        filterActive: function() {
            this.$("li.archived").addClass("hidden");
        },

        filterAll: function() {
            this.$("li.archived").removeClass("hidden");
        }
    });
})(jQuery, chorus.views);
