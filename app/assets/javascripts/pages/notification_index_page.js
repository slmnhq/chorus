chorus.pages.NotificationIndexPage = chorus.pages.Base.extend({
    constructorName: "NotificationIndexPage",
    crumbs: [
        { label: t("breadcrumbs.home"), url: "#/" },
        { label: t("breadcrumbs.notifications") }
    ],

    setup: function() {
        this.collection = new chorus.collections.NotificationSet([]);
        this.bindings.add(this.collection, "loaded", this.notificationsFetched, this);
        this.collection.fetch();

        chorus.PageEvents.subscribe("notification:deleted", this.refreshNotifications, this);

        this.mainContent = new chorus.views.MainContentView({
            collection: this.collection,
            contentHeader:chorus.views.StaticTemplate("default_content_header", {title:t("header.your_notifications")}),
            content: new chorus.views.NotificationList({ collection: this.collection, allowMoreLink: true })
        });
    },

    notificationsFetched: function() {
        this.collection.markAllRead({})
        this.render();
    },

    refreshNotifications: function() {
        this.collection.fetch()
    }
});