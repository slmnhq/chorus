; (function($, ns) {
    ns.Header = chorus.views.Base.extend({
        className : "header",
        events : {
            "click .username a" : "togglePopupUsername",
            "click .account a" : "togglePopupAccount"
        },

        makeModel : function(){
            this.model = chorus.user;
        },

        additionalContext : function(ctx) {
            if (!ctx.fullName) {
                ctx.fullName = ctx.firstName + ' ' + ctx.lastName;
            }

            if (ctx.fullName.length > 20){
                return {
                    fullName : ctx.firstName + ' ' + ctx.lastName[0] + '.'
                }
            }
        },

        togglePopupUsername : function(e) {
            e.preventDefault();

            var userNameWasPoppedUp = !this.$(".menu.popup_username").hasClass("hidden");
            this.dismissPopups();
            this.$(".menu.popup_username").toggleClass("hidden", userNameWasPoppedUp);
        },

        togglePopupAccount : function(e) {
            e.preventDefault();

            var accountNameWasPoppedUp = !this.$(".menu.popup_account").hasClass("hidden");
            this.dismissPopups();
            this.$(".menu.popup_account").toggleClass("hidden", accountNameWasPoppedUp)
        },

        dismissPopups : function() {
            this.$(".menu").addClass("hidden");
        }
    });
})(jQuery, chorus.views);