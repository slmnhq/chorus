;(function(ns) {
    ns.alerts.Base = ns.Modal.extend({
        className : "alert",
        
        events : {
            "click button.cancel" : "closeModal"
        },

        additionalContext : function (ctx) {
            return {
                title : this.title,
                text : this.text,
                ok : this.ok
            }
        },

        postRender : function () {
            this.events = this.events || {};
            this.events["click button.cancel"] = this.events["click button.cancel"] || "closeModal";
            this.delegateEvents();
        },
    })
})(chorus)
