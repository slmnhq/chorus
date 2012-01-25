;(function(ns) {
    ns.pages.InstanceIndexPage = ns.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.instances") }
        ],

        setup : function() {
            this.collection = new ns.collections.InstanceSet();
            this.collection.fetchAll();

            this.mainContent = new ns.views.MainContentView({
                contentHeader : new ns.views.StaticTemplate("default_content_header", {title: t("instances.title_plural")}),
                contentDetails : new ns.views.InstanceIndexContentDetails({collection : this.collection}),
                content : new ns.views.InstanceList({collection : this.collection})
            });

            this.sidebar = new ns.views.InstanceListSidebar();

            this.forwardEvent("instance:added", this.mainContent.content);

            //copypasta'd from workfile, next time make into a mixin
            this.mainContent.content.forwardEvent("instance:selected", this.sidebar);
            this.mainContent.content.bind("instance:selected", this.setModel, this);
        },

        setModel: function(instance) {
            this.model = instance;
        }
    });
})
(chorus);
