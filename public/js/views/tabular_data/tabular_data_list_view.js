chorus.views.TabularDataList = chorus.views.SelectableList.extend({
    templateName: "tabular_data_list",
    useLoadingSection: true,
    eventName: "tabularData",

    postRender: function() {
        var $list = $(this.el);
        this.collection.each(function(model) {
            var view = new chorus.views.TabularData({ model: model, activeWorkspace: this.options.activeWorkspace, checkable: this.options.checkable });
            $list.append(view.render().el);
        }, this);
        this._super("postRender", arguments);
    }
});
