chorus.views.DatasetList = chorus.views.SelectableList.extend({
    className: "dataset_list",
    useLoadingSection: true,

    postRender: function() {
        var $list = $(this.el);
        this.collection.each(function(model) {
            var view = new chorus.views.Dataset({ model: model, activeWorkspace: this.options.activeWorkspace });
            $list.append(view.render().el);
        }, this);
        this._super("postRender", arguments);
    },

    itemSelected: function(model) {
        chorus.PageEvents.broadcast("tabularData:selected", model);
    }
});
