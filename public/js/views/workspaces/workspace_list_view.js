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

        filterActive: function() {
          this.$("li.archived").addClass("hidden");
        },

        filterAll: function() {
          this.$("li.archived").removeClass("hidden");
        }
    });
})(jQuery, chorus.views);
