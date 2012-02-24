chorus.dialogs.Attach = chorus.dialogs.Base.extend({
    className: 'attach_dialog',
    emptyListTranslationKey: "none",

    events:{
        "click li":"toggleSelection",
        "click .submit":"submit"
    },

    toggleSelection:function (event) {
        event.preventDefault();
        $(event.target).closest("li").toggleClass("selected");
        if (this.$('li.selected').length > 0) {
            this.$('button.submit').removeAttr('disabled');
        } else {
            this.$('button.submit').attr('disabled', 'disabled');
        }
    },

    submit:function () {
        var attachments = _.map(this.$("li.selected"), function (li) {
            var id = $(li).data("id");
            return this.collection.get(id);
        }, this);

        this.selectedAttachments = new this.collectionClass(attachments, { workspaceId:this.collection.get("workspaceId") });
        this.trigger(this.selectedEvent, this.selectedAttachments);
        this.closeModal();
    },

    postRender:function () {
        if (!this.options.selectedAttachments) {
            return;
        }
        _.each(this.$('li'), function (li) {
            if (this.options.selectedAttachments.get($(li).data('id'))) {
                $(li).addClass('selected');
            }
        }, this);
    }
})