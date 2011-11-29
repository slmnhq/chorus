;(function($, ns) {
    ns.views.LinkMenu = ns.views.Base.extend({
        className : "link_menu",
        events : {
            "click a.popup" : "togglePopup"
        },
        context : function(){
            if (!this.options.chosen) this.options.chosen = this.options.options[0].text
            return this.options
        },

        togglePopup : function(e){
            e.preventDefault();
            this.$(".menu").toggleClass("hidden");
        }
    })
})(jQuery, chorus);