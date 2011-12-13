;
(function($, ns) {
    ns.Header = chorus.views.Base.extend({
        className : "header",
        events : {
            "click .username a" : "togglePopupUsername",
            "click .account a" : "togglePopupAccount"
        },

        makeModel : function() {
            this.model = chorus.session;
        },

        setup : function() {
            $(document).bind("chorus:menu:popup", _.bind(this.popupEventHandler, this))
        },

        additionalContext : function(ctx) {
            if (!ctx.fullName) {
                ctx.fullName = ctx.firstName + ' ' + ctx.lastName;
            }

            var user = this.model.user()

            return {
                displayName : (ctx.fullName.length > 20 ? (ctx.firstName + ' ' + ctx.lastName[0] + '.') : ctx.fullName),
                userUrl : user && user.showUrl()
            }
        },

        togglePopupUsername : function(e) {
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

        togglePopupAccount : function(e) {
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

        triggerPopupEvent : function(el) {
            $(document).trigger("chorus:menu:popup", el);
        },

        captureClicks : function() {
            $(document).bind("click.popup_menu", _.bind(this.dismissPopups, this));
        },

        releaseClicks : function () {
            $(document).unbind("click.popup_menu");
        },

        popupEventHandler : function(ev, el) {
            if ($(el).closest(".header").length == 0) {
                this.dismissPopups();
                this.releaseClicks();
            }
        },

        dismissPopups : function() {
            this.releaseClicks();
            this.$(".menu").addClass("hidden");
        }
    });
})(jQuery, chorus.views);
