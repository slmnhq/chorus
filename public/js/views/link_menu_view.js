;(function($, ns) {
    ns.views.LinkMenu = ns.views.Base.extend({
        className : "link_menu",

        events : {
            "click a.popup" : "popupLinkClicked",
            "click .menu a" : "choose"
        },

        setup : function() {
            $("html").bind("chorus:menu:popup", _.bind(this.popupEventHandler, this))
        },

        context : function(){
            var self=this;
            if (!this.options.chosen) this.options.chosen = this.options.options[0].text
            var chosen = _.find(this.options.options, function(option) {
                return option.text == self.options.chosen;
            })
            _.each(this.options.options, function(option){
                option.hiddenClass = "hidden";
            })
            chosen.hiddenClass = "";
            return this.options
        },

        popupLinkClicked : function(ev){
            var becomingVisible = this.$(".menu").hasClass("hidden");

            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.togglePopup();

            this.triggerPopupEvent();
            
            if (becomingVisible) {
                this.captureClicks();
            } else {
                this.releaseClicks();
            }
        },

        togglePopup : function() {
            this.$(".menu").toggleClass("hidden");
        },

        captureClicks : function() {
            $("html").bind("click.popup_menu", _.bind(this.dismissMenu, this));
        },

        dismissMenu : function(ev) {
            this.togglePopup();
            this.releaseClicks();
        },

        releaseClicks : function () {
            $("html").unbind("click.popup_menu");
        },

        triggerPopupEvent : function(ev) {
            $("html").trigger("chorus:menu:popup", this.$(".popup"));
        },

        popupEventHandler : function(ev, el) {
            if (!$(el).is(this.$(".popup")) && !this.$(".menu").hasClass("hidden")) {
                this.togglePopup();
                this.releaseClicks();
            }
        },

        choose : function(e) {
            e.preventDefault();
            var ul = $(e.target).closest("ul");
            this.trigger("choice", ul.data("event"), $(e.target).closest('li').data("type"));
            this.options.chosen = $(e.target).text();
            this.dismissMenu();
            this.render();
        }
    })
})(jQuery, chorus);