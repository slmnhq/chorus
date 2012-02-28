chorus.views.ShuttleWidget = chorus.views.Base.extend({
    className:"shuttle_widget",

    events:{
        "click a.add":"toggleAdd",
        "click a.remove":"toggleAdd",
        "click a.add_all":"addAll",
        "click a.remove_all":"removeAll"
    },

    setup:function () {
        this.selectionSource = this.options.selectionSource;
        this.bindings.add(this.selectionSource, "reset", this.render);
        this.nonRemovableModels = this.options.nonRemovable;
    },

    collectionModelContext:function (model) {
        var ctx = {};
        var selections = this.selectionSource.map(function (item) {
            return item.get("id")
        });
        ctx.isAdded = _.include(selections, model.get("id"));
        ctx.displayName = model.displayName();
        ctx.imageUrl = model.imageUrl();

        var nonRemovableModelIds = _.map(this.nonRemovableModels, function (model) {
            return model.get("id")
        });
        ctx.isNonRemovable = _.include(nonRemovableModelIds, model.get("id"));
        ctx.nonRemovableText = this.options.nonRemovableText;

        return ctx;
    },

    additionalContext:function () {
        return { objectName:this.options.objectName };
    },

    postRender:function () {
        this._updateLabels();
        chorus.search({
            input:this.$("input"),
            list:this.$("ul.available"),
            selector:".name"
        });
    },

    toggleAdd:function (e) {
        e.preventDefault();

        var target = this.$(e.currentTarget);
        var id = target.closest("li").data("id");
        var isAdding = target.closest("ul").hasClass("available");

        this.$("li[data-id='" + id + "']").toggleClass("added", isAdding);

        this._updateLabels();
    },

    getSelectedIDs:function () {
        var selectedItems = this.$('ul.selected li.added');
        return _.map(selectedItems, function (item) {
            return $(item).data("id").toString();
        });
    },

    addAll:function (e) {
        e.preventDefault();
        this.$("li").addClass("added");
        this._updateLabels();
    },

    removeAll:function (e) {
        e.preventDefault();

        this.$("li").removeClass("added");
        this.$("li.non_removable").addClass('added');
        this._updateLabels();
    },

    _updateLabels:function () {
        this.$(".selected_count").text(this.$("ul.selected li.added").length);
    }
})

