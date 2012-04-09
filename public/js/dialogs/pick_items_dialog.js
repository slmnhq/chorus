chorus.dialogs.PickItems = chorus.dialogs.Base.extend({
    className: 'pick_items',
    useLoadingSection: true,
    additionalClass: "with_sub_header",

    events: {
        "click .submit": "submit",
        "click li": 'selectItem',
        "dblclick li": "doubleClick"
    },

    subviews: {
        ".pagination": "paginationView"
    },

    setup: function() {
        if (!this.collection.comparator) {
            this.collection.comparator = this.collectionComparator;
        }

        this.multiSelection = this.options.multiSelection || false;
        this.collection.onLoaded(this.collection.sort, this.collection);

        if (this.pagination) {
            this.paginationView = new chorus.views.ListContentDetails({
                collection: this.collection,
                modelClass: this.modelClass
            });
        }
    },

    submit: function() {
        var attachments = _.map(this.$("li.selected"), function(li) {
            var id = $(li).data("id");
            return this.collection.get(id);
        }, this);

        this.trigger(this.selectedEvent, attachments);
        this.closeModal();
    },

    postRender: function() {
        chorus.search({
            input: this.$("input"),
            list: this.$(".items ul"),
            onFilter: this.deselectItem,
            afterFilter: _.bind(this.afterFilter, this)
        });

        if (this.options.defaultSelection) {
            _.each(this.options.defaultSelection.models, function(model) {
                this.$("li[data-id='" + model.get("id") + "']").addClass("selected");
            }, this);
        }

        this.enableOrDisableSubmitButton();
    },

    collectionModelContext: function(model) {
        return {
            name: model.name(),
            imageUrl: ""
        }
    },

    collectionComparator: function(model) {
        return model.name().toLowerCase();
    },

    additionalContext: function() {
        return {
            pagination: this.pagination,
            placeholderTranslation: this.searchPlaceholderKey || "pickitem.dialog.search.placeholder",
            emptyListTranslationKey: this.emptyListTranslationKey || "pickitem.dialog.empty",
            submitButtonTranslationKey: this.submitButtonTranslationKey || "pickitem.dialog.submit"
        }
    },

    enableOrDisableSubmitButton: function() {
        if (this.$("li.selected").length > 0) {
            this.$('button.submit').removeAttr('disabled');
        } else {
            this.$('button.submit').attr('disabled', 'disabled');
        }
    },

    afterFilter: function() {
        this.enableOrDisableSubmitButton();
        if (this.$("li.selected").length == 0) {
            this.trigger("item:selected", undefined);
        }
    },

    deselectItem: function(el) {
        el.removeClass("selected");
    },

    selectItem: function(e) {
        if (!this.multiSelection) {
            this.$("li").removeClass("selected");
        }

        $(e.currentTarget).toggleClass("selected");
        this.trigger("item:selected", this.selectedItem());
        this.enableOrDisableSubmitButton();
    },

    selectedItem: function() {
        var ids = _.map(this.$("ul li.selected"), function(item) {
            return $(item).data("id");
        });

        if (this.multiSelection) {
            return _.map(ids, function(id) {
                return this.collection.get(id);
            }, this);

        } else {
            return this.collection.get(ids[0]) || undefined;
        }
    },

    doubleClick: function(e) {
        $(e.currentTarget).toggleClass("selected");
        this.trigger("item:doubleclick", _.flatten([this.selectedItem()]));
    }
});
