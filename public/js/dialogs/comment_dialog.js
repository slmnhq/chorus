chorus.dialogs.Comment = chorus.dialogs.Base.extend({
    className:"comment",
    title:t("comments.new_dialog.title"),
    persistent:true,
    events:{
        "submit form":"save"
    },

    makeModel:function () {
        this._super("makeModel", arguments);

        this.model = new chorus.models.Comment({
            entityType:this.options.launchElement.data("entity-type"),
            entityId:this.options.launchElement.data("entity-id")
        });
        this.model.bind("saved", this.saved, this);

        this.entityTitle = this.options.launchElement.data("entity-title")
    },

    additionalContext:function () {
        return { entityTitle:this.entityTitle }
    },

    save:function (e) {
        e.preventDefault();
        this.model.save({body:this.$("textarea[name=body]").val().trim()})
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    }

});
