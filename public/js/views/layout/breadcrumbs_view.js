chorus.views.BreadcrumbsView = chorus.views.Base.extend({
    constructorName: "BreadcrumbsView",
    className:"breadcrumbs",
    context: function () {
        return this.options;
    },

    postRender: function() {
        var $crumb = this.$(".breadcrumb");
        _.each(this.context().breadcrumbs, function(breadcrumb, index){
            if (breadcrumb.data) {
                $crumb.eq(index).find('a').data(breadcrumb.data);
            }
        });
    }
});