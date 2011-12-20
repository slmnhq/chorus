;(function(ns) {
    ns.pages.InstanceIndexPage = ns.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances") }
        ],

        setup : function() {
            this.collection = new ns.models.InstanceSet();
            this.collection.fetchAll();

            this.mainContent = new ns.views.MainContentView({
                contentHeader : new ns.views.StaticTemplate("default_content_header", {title: t("instance.plural")}),
                contentDetails : new ns.views.InstanceIndexContentDetails({collection : this.collection}),
                content : new ns.views.InstanceList({collection : this.collection})
            });
        }
    });
})
(chorus);
