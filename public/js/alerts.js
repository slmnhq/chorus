chorus.alerts.Base = chorus.Modal.extend({
    className:"alert",

    events:{
        "click button.cancel":"closeModal",
        "click button.submit":"confirmAlert"
    },

    confirmAlert:$.noop,

    additionalContext:function (ctx) {
        return {
            title:this.title,
            text:this.text,
            body:this.body,
            ok:this.ok,
            cancel:this.cancel || t("actions.cancel")
        }
    },

    revealed:function () {
        $("#facebox").removeClass().addClass("alert_facebox");
        var cancelButton = this.$("button.cancel");
        if (cancelButton) {
            cancelButton.focus();
        }
    }
})

chorus.alerts.ModelDelete = chorus.alerts.Base.extend({
    events:_.extend({}, chorus.alerts.Base.prototype.events, {
        "click button.submit":"deleteModel"
    }),

    persistent:true, //here for documentation, doesn't actually do anything as we've overwritten bindCallbacks

    bindCallbacks:function () {
        this.model.bind("destroy", this.modelDeleted, this);
        this.model.bind("destroyFailed", this.render, this);
    },

    close:function () {
        this.model.unbind("destroy", this.modelDeleted);
        this.model.unbind("destroyFailed", this.render);
    },

    deleteModel:function (e) {
        e.preventDefault();
        this.model.destroy();
    },

    deleteMessageParams:$.noop,

    modelDeleted:function () {
        $(document).trigger("close.facebox");
        chorus.toast(this.deleteMessage, this.deleteMessageParams());
        if (this.redirectUrl) {
            chorus.router.navigate(this.redirectUrl, true);
        }
    }

})
