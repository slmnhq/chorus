chorus.dialogs.Attach = chorus.dialogs.Base.extend({
    className: 'attach_dialog',
    useLoadingSection: true,
    events: {
        "click .submit" : "submit"
    },

    enableOrDisableSubmitButton: function(items) {
        if (items && items.length > 0) {
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

        this.selectedAttachments = new this.collectionClass(attachments, { workspaceId: this.collection.get("workspaceId") });
        this.trigger(this.selectedEvent, this.selectedAttachments);
        this.closeModal();
    },

    setup: function() {
        var self = this;
        var picklist = chorus.views.CollectionPicklist.extend({
            collectionComparator: self.picklistCollectionModelComparator,
            collectionModelContext: self.picklistCollectionModelContext
        });

        this.picklistView = new picklist({ collection: this.collection, defaultSelection: this.options.selectedAttachments, multiSelection: true });
        this.picklistView.bind("item:selected", this.enableOrDisableSubmitButton, this);
    },

    postRender:function () {
        this.picklistView.searchPlaceholderKey = this.searchPlaceholderKey;
        this.picklistView.render();
        this.$(".dialog_content .picklist").append(this.picklistView.el);
        this.picklistView.delegateEvents();
    },

    picklistCollectionModelContext: $.noop,
    picklistCollectionModelComparator: $.noop
})