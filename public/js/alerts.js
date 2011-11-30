;(function(ns) {
    ns.alerts.Base = ns.Modal.extend({
        className : "alert",
        
        events : {
            "click button.cancel" : "closeModal",
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

    ns.alerts.DeleteModel = ns.alerts.Base.extend({
        events : _.extend({}, ns.alerts.Base.prototype.events, {
            "click button.submit" : "deleteModel"
        }),

        persistent: true, //here for documentation, doesn't actually do anything as we've overwritten bindCallbacks

        bindCallbacks : function(){
            this.model.bind("destroy", this.modelDeleted, this);
            this.model.bind("destroyFailed", this.render, this);
        },

        deleteModel : function (e) {
            e.preventDefault();
            this.model.destroy();
        },

        modelDeleted : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate(this.redirectUrl || "/", true);
        }
    })
})(chorus)
