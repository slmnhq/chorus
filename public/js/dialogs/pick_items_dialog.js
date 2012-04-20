chorus.dialogs.PickItems = chorus.dialogs.Base.extend({
    constructorName: "PickItems",

    templateName: 'pick_items',
    useLoadingSection: true,
    additionalClass: "with_sub_header",

    events: {
        "click button.submit": "submitClicked",
        "click li": 'selectItem',
        "dblclick li": "doubleClick"
    },

    subviews: {
        ".pick_items_list": "pickItemsList"
    },

    setup: function() {
        if (!this.collection.comparator) {
            this.collection.comparator = this.collectionComparator;
        }

        this.collection.onLoaded(this.collection.sort, this.collection);

        this.pickItemsList = new chorus.views.PickItemsList({
            collection: this.collection,
            modelClass: this.modelClass,
            pagination: this.pagination,
            emptyListTranslationKey: this.emptyListTranslationKey
        });
        this.pickItemsList.collectionModelContext = this.collectionModelContext; // forwarding inheritance on to pickItemsList

        this.bindings.add(this.collection, 'searched', this.enableOrDisableSubmitButton);
    },

    selectionFinished: function() {
        var listOrItem = this.selectedItem();
        var selectedItems = _.isArray(listOrItem) ? listOrItem : [listOrItem];

        this.trigger(this.selectedEvent, selectedItems);
        this.closeModal();
    },

    postRender: function() {
        if (this.serverSideSearch) {
            this.renderServerSideSearch();
        } else {
            this.renderClientSideSearch();
        }

        var preSelected = this.options.defaultSelection;
        if (preSelected) {
            if(preSelected.models) {
                _.each(this.options.defaultSelection.models, function(model) {
                    this.$("li[data-id='" + model.get("id") + "']").addClass("selected");
                }, this);
            } else {
                this.$("li[data-id='" + preSelected.get("id") + "']").addClass("selected");
            }
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
            placeholderTranslation: this.searchPlaceholderKey || "pickitem.dialog.search.placeholder",
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
        this.selectItem(e);
        this.submit();
    },

    renderServerSideSearch: function() {
        var onTextChangeFunction = _.debounce(_.bind(function(e) {
            this.collection.search($(e.target).val());
        }, this), 300);

        chorus.search({
            input: this.$(".sub_header input:text"),
            onTextChange: onTextChangeFunction
        });
    },

    renderClientSideSearch: function () {
        var afterFilter = function() {
            this.enableOrDisableSubmitButton();
            if (this.$("li.selected").length == 0) {
                this.trigger("item:selected", undefined);
            }
        }

        var deselectItem = function(el) {
            el.removeClass("selected");
        }

        chorus.search({
            input: this.$("input"),
            list: this.$(".items ul"),
            onFilter: deselectItem,
            afterFilter: _.bind(afterFilter, this)
        });
    },

    submitClicked: function(e) {
        e.preventDefault();
        this.submit();
    },

    submit: function() {
        this.selectionFinished();
    }
});
