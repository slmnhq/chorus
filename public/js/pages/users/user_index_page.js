(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: "Home", url: "/" },
            { label: "Users" }
        ],

        setup : function() {
            this.collection = new chorus.models.UserSet();
            this.collection.fetch();
            this.mainContent = new chorus.views.MainContentList({modelClass : "User", collection : this.collection})
            this.sidebar = new chorus.views.StaticTemplate("user_index_sidebar");
        }
    });
})
    (jQuery, chorus.pages);
