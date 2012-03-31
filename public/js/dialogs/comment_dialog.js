chorus.dialogs.Comment = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
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
        this.bindings.add(this.model, "saved", this.saved);

        this.entityTitle = this.options.launchElement.data("entity-title")
    },

    additionalContext:function () {
        return { entityTitle:this.entityTitle }
    },

    postRender: function() {
        _.defer(_.bind(function() {
            this.makeEditor($(this.el), ".toolbar", "body", { width: 350 });
        }, this));
    },

    save:function (e) {
        e.preventDefault();
        this.model.save({body: this.getNormalizedText(this.$("textarea[name=body]"))});
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    }
});
