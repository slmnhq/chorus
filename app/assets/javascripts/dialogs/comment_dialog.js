chorus.dialogs.Comment = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    templateName:"comment",
    title:t("comments.new_dialog.title"),
    persistent:true,

    events: {
        "submit form":"save"
    },

    makeModel:function () {
        this._super("makeModel", arguments);

        this.model = new chorus.models.Comment({
            entityType: this.options.entityType,
            entityId: this.options.entityId
        });
        this.bindings.add(this.model, "saved", this.saved);
    },

    additionalContext:function () {
        return { entityTitle: this.options.entityTitle };
    },

    postRender: function() {
        _.defer(_.bind(function() {
            this.makeEditor($(this.el), ".toolbar", "body", { width: 566, height: 150 });
        }, this));
    },

    save:function (e) {
        e.preventDefault();
        this.model.save({ body: this.getNormalizedText(this.$("textarea[name=body]")) });
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        this.closeModal();
    }
});
