; (function($, ns) {
    ns.Header = chorus.views.Base.extend({
        className : "header",
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
        }
    });
})(jQuery, chorus.views);