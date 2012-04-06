chorus.dialogs.Attach = chorus.dialogs.Base.extend({
    className: 'attach_dialog',
    useLoadingSection: true,
    events: {
        "click .submit" : "submit"
    },

    enableButtons: function(items) {
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
        this.picklistView = new chorus.views.CollectionPicklist({ collection: this.collection, defaultSelection: this.options.selectedAttachments, multiSelection: true });
        this.picklistView.collectionModelContext = this.picklistCollectionModelContext;
        this.picklistView.collectionModelComparator = this.picklistCollectionModelComparator;
        this.picklistView.bind("item:selected", this.enableButtons, this);
    },

    postRender:function () {
        this.picklistView.render();
        this.$(".dialog_content .picklist").append(this.picklistView.el);
        this.picklistView.delegateEvents();
    },

    picklistCollectionModelContext: $.noop,
    picklistCollectionModelComparator: $.noop
})