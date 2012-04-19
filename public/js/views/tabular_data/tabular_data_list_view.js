chorus.views.TabularDataList = chorus.views.SelectableList.extend({
    templateName: "tabular_data_list",
    useLoadingSection: true,
    eventName: "tabularData",

    events: {
        "click li input[type=checkbox]": "checkboxClicked"
    },

    setup: function() {
        this._super("setup", arguments);
        this.selectedDatasets = new chorus.collections.TabularDataSet();
    },

    postRender: function() {
        var $list = $(this.el);
        this.collection.each(function(model) {
            var view = new chorus.views.TabularData({ model: model, activeWorkspace: this.options.activeWorkspace, checkable: this.options.checkable });
            $list.append(view.render().el);
        }, this);
        this._super("postRender", arguments);
    },

    checkboxClicked: function(e) {
        e.stopImmediatePropagation();

        var checkbox = this.$("input[type=checkbox]");
        var isChecked = checkbox.is(":checked");
        var index = checkbox.index(e.currentTarget);

        if (isChecked) {
            this.selectedDatasets.add(this.collection.at(index));
        } else {
            this.selectedDatasets.remove(this.collection.at(index));
        }

        chorus.PageEvents.broadcast("tabularData:checked", this.selectedDatasets);
    }
});
