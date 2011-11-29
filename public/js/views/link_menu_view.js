;(function($, ns) {
    ns.views.LinkMenu = ns.views.Base.extend({
        className : "link_menu",
        context : function(){
            return {
                options : this.options.options
            }
        }
    })
})(jQuery, chorus);