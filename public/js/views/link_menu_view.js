;(function($, ns) {
    ns.views.LinkMenu = ns.views.Base.extend({
        className : "link_menu",
        context : function(){
            return this.options
        }
    })
})(jQuery, chorus);