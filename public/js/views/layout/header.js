chorus.views.Header = chorus.views.Base.extend({
    className:"header",
    events:{
        "click .username a":"togglePopupUsername",
        "click .account a":"togglePopupAccount",
        "click .notifications a":"togglePopupNotifications"
    },

    subviews: {
        ".popup_notifications ul": "notificationList"
    },

    setup:function () {
        $(document).bind("chorus:menu:popup", _.bind(this.popupEventHandler, this))
        this.session = chorus.session;
        this.notifications = new chorus.collections.NotificationSet();
        this.requiredResources.add([this.session, this.notifications]);
        this.notifications.fetchAll();
    },

    additionalContext:function (ctx) {
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

    resourcesLoaded: function() {
        this.notificationList = new chorus.views.ActivityList({
            collection: this.notifications.activities(),
            suppressHeading: true,
            isNotification: true
        });
    },

    togglePopupNotifications: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var notificationsWasPoppedUp = !this.$(".menu.popup_notifications").hasClass("hidden");
        this.dismissPopups();
        this.triggerPopupEvent(e.target);

        if(!notificationsWasPoppedUp) {
            this.captureClicks();
        }

        this.$(".menu.popup_notifications").toggleClass("hidden", notificationsWasPoppedUp);
    },

    togglePopupUsername:function (e) {
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

    togglePopupAccount:function (e) {
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

    triggerPopupEvent:function (el) {
        $(document).trigger("chorus:menu:popup", el);
    },

    captureClicks:function () {
        $(document).bind("click.popup_menu", _.bind(this.dismissPopups, this));
    },

    releaseClicks:function () {
        $(document).unbind("click.popup_menu");
    },

    popupEventHandler:function (ev, el) {
        if ($(el).closest(".header").length == 0) {
            this.dismissPopups();
            this.releaseClicks();
        }
    },

    dismissPopups:function () {
        this.releaseClicks();
        this.$(".menu").addClass("hidden");
    }
});
