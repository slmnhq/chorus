chorus.views.Header = chorus.views.Base.extend({
    constructorName: "HeaderView",
    className: "header",
    events: {
        "click .username a": "togglePopupUsername",
        "click .account a": "togglePopupAccount",
        "click a.notifications": "togglePopupNotifications",
        "click .gear a": "togglePopupGear",
        "submit .search form": "startSearch",
        "click .type_ahead_result a": "dismissSearch"
    },

    subviews: {
        ".popup_notifications ul": "notificationList",
        ".type_ahead_result": "typeAheadView"
    },

    setup: function() {
        this.popupEventName = "chorus:menu:popup." + this.cid;
        $(document).bind(this.popupEventName, _.bind(this.popupEventHandler, this))
        this.session = chorus.session;
        this.notifications = new chorus.collections.NotificationSet([], { type: 'unread' });
        this.requiredResources.add([this.session, this.notifications]);

        this.typeAheadView = new chorus.views.TypeAheadSearch();

        this.notificationList = new chorus.views.ActivityList({
            collection: new chorus.collections.ActivitySet(),
            isNotification: true
        });

        this.bindings.add(this.notifications, "reset", function() {
            this.notificationList.collection.reset(this.notifications.activities().models);
            this.notificationList.collection.loaded = true;
            this.render();
        });
        this.notifications.fetchAll();

        chorus.PageEvents.subscribe("notification:deleted", this.refreshNotifications, this);
    },

    postRender: function() {
        this.$(".search input").unbind("textchange").bind("textchange", _.bind(this.displayResult, this));
    },

    displayResult: function() {
        var query = this.$(".search input").val();
        this.typeAheadView.searchFor(query);
        this.$(".type_ahead_result").toggleClass("hidden", query.length === 0);
    },

    dismissSearch: function() {
        this.$(".search input").val('');
        this.$(".type_ahead_result").addClass("hidden");
    },

    beforeNavigateAway: function() {
        $(document).unbind(this.popupEventName);
        this._super("beforeNavigateAway");
    },

    additionalContext: function(ctx) {
        this.requiredResources.reset()
        var user = this.session.user();
        var firstName = this.session.get("firstName");
        var lastName = this.session.get("lastName");
        var fullName = this.session.get("fullName") || ([firstName, lastName].join(' '));

        return _.extend(ctx, this.session.attributes, {
            notifications: this.notifications,
            displayName: (fullName.length > 20 ? (firstName + ' ' + lastName[0] + '.') : fullName),
            userUrl: user && user.showUrl()
        });
    },

    refreshNotifications: function() {
        this.notifications.fetchAll();
    },

    togglePopupNotifications: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if ($(e.currentTarget).hasClass("empty")) { return; }

        var beingShown = this.$(".menu.popup_notifications").hasClass("hidden");
        this.dismissPopups();
        this.triggerPopupEvent(e.target);

        if (beingShown) {
            this.captureClicks();
            this.notifications.markAllRead({ success: _.bind(this.clearNotificationCount, this) });
        }

        this.$(".menu.popup_notifications").toggleClass("hidden", !beingShown);
    },

    clearNotificationCount: function() {
        this.$("a.notifications").text("0").addClass("empty")
    },

    togglePopupUsername: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var userNameWasPoppedUp = !this.$(".menu.popup_username").hasClass("hidden");
        this.dismissPopups();
        this.triggerPopupEvent(e.target);

        if (!userNameWasPoppedUp) {
            this.captureClicks();
        }

        this.$(".menu.popup_username").toggleClass("hidden", userNameWasPoppedUp);
    },

    togglePopupGear: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var gearNameWasPoppedUp = !this.$(".menu.popup_gear").hasClass("hidden");
        this.dismissPopups();
        this.triggerPopupEvent(e.target);

        if (!gearNameWasPoppedUp) {
            this.captureClicks();
        }

        this.$(".menu.popup_gear").toggleClass("hidden", gearNameWasPoppedUp);
    },

    togglePopupAccount: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var accountNameWasPoppedUp = !this.$(".menu.popup_account").hasClass("hidden");
        this.dismissPopups();
        this.triggerPopupEvent(e.target);

        if (!accountNameWasPoppedUp) {
            this.captureClicks();
        }

        this.$(".menu.popup_account").toggleClass("hidden", accountNameWasPoppedUp)
    },

    triggerPopupEvent: function(el) {
        $(document).trigger("chorus:menu:popup", el);
    },

    captureClicks: function() {
        $(document).bind("click.popup_menu", _.bind(this.dismissPopups, this));
    },

    releaseClicks: function() {
        $(document).unbind("click.popup_menu");
    },

    popupEventHandler: function(ev, el) {
        if ($(el).closest(".header").length == 0) {
            this.dismissPopups();
            this.releaseClicks();
        }
    },

    dismissPopups: function() {
        this.releaseClicks();
        this.$(".menu").addClass("hidden");
    },

    startSearch: function(e) {
        e.preventDefault();
        var search = new chorus.models.SearchResult({
            workspaceId: this.options.workspaceId,
            query: encodeURIComponent(this.$(".search input:text").val())
        });
        chorus.router.navigate(search.showUrl(), true);
    }
});
