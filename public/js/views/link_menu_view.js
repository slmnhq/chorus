;(function($, ns) {
    ns.views.LinkMenu = ns.views.Base.extend({
        className : "link_menu",
        events : {
            "click a.popup" : "togglePopup",
            "click li a" : "choose"
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

        togglePopup : function(e){
            e.preventDefault();
            this.$(".menu").toggleClass("hidden");
        },

        choose : function(e) {
            e.preventDefault();
            this.trigger("choice", $(e.target).closest('li').data("type"));
            this.options.chosen = $(e.target).text();
            this.render();
        }
    })
})(jQuery, chorus);