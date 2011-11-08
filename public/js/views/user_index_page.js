(function($, ns) {
    ns.UserIndexPage = chorus.views.Base.extend({
        className : "user_index_page",

        setup: function() {
            _.bindAll(this, 'render');
            chorus.user.bind("change", this.render);
        },

        crumbs : [
                    { label: "Home", url: "/" },
                    { label: "Users" }
                ],

        postRender : function(el) {
            new ns.Header({ el : el.find("#header") }).render();

            var breadcrumbsView = new ns.BreadcrumbsView({
                breadcrumbs: this.crumbs
            });
            this.$("#breadcrumbs").append(breadcrumbsView.render().el);

            var userSet = new chorus.models.UserSet();
            new ns.UserSet({collection: userSet, el : el.find("#user_list") }).render();
            userSet.fetch();
        }
    });
})(jQuery, chorus.views);
