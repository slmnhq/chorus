chorus.pages.NotificationIndexPage = chorus.pages.Base.extend({
    constructorName: "NotificationIndexPage",
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.notifications") }
    ],

    setup: function() {
        this.collection = new chorus.collections.NotificationSet([]);
        this.requiredResources.push(this.collection);
        this.collection.fetch();
    },

    resourcesLoaded: function() {
        this.mainContent = new chorus.views.MainContentView({
            collection: this.collection,
            contentHeader:chorus.views.StaticTemplate("default_content_header", {title:t("header.my_notifications")}),
            content: new chorus.views.NotificationList({ collection: this.collection, allowMoreLink: true })
        });
    }
});