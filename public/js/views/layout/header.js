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
            this.$(".menu").toggleClass("hidden");
        },

        togglePopupAccount : function(e) {
            e.preventDefault();
        }
    });
})(jQuery, chorus.views);