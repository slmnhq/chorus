;(function(ns) {
    ns.Base = chorus.views.Base.extend({
        className : "alert",
        events : {
            "click button.cancel" : "closeAlert"
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
            this.events["click button.cancel"] = this.events["click button.cancel"] || "closeAlert";
            this.delegateEvents();
        },

        launchAlert : function() {
            this.render();
            _.bind(this.revealed, this);
            $(document).bind('reveal.facebox', this.revealed);
            $.facebox(this.el)
        },

        revealed : function () {
            $("#facebox").removeClass().addClass("alert_facebox");
        },

        closeAlert : function() {
            $(document).trigger("close.facebox");
        }
    })
})(chorus.alerts)