chorus.views.TabularDataList = chorus.views.SelectableList.extend({
    templateName: "tabular_data_list",
    useLoadingSection: true,
    eventName: "tabularData",

    events: {
        "click  li input[type=checkbox]": "checkboxClicked",
        "change li input[type=checkbox]": "checkboxChanged"
    },

    setup: function() {
        this._super("setup", arguments);
        this.selectedDatasets = new chorus.collections.DatabaseObjectSet();
        this.selectedDatasets.attributes = this.collection.attributes;
        chorus.PageEvents.subscribe("selectAll", this.selectAll, this);
        chorus.PageEvents.subscribe("selectNone", this.selectNone, this);
    },

    selectAll: function() {
        this.bindings.add(this.selectedDatasets, "reset", this.selectAllFetched);
        this.selectedDatasets.fetchAll();
    },

    selectAllFetched: function() {
        this.$("> li input[type=checkbox]").prop("checked", true);
        chorus.PageEvents.broadcast("tabularData:checked", this.selectedDatasets);
    },

    selectNone: function() {
        this.selectedDatasets.reset([]);
        this.$("> li input[type=checkbox]").prop("checked", false);
        chorus.PageEvents.broadcast("tabularData:checked", this.selectedDatasets);
    },

    postRender: function() {
        var $list = $(this.el);
        this.collection.each(function(model) {
            var view = new chorus.views.TabularData({ model: model, activeWorkspace: this.options.activeWorkspace, checkable: this.options.checkable });
            $list.append(view.render().el);
        }, this);
        this._super("postRender", arguments);

        this.checkSelectedDatasets();
    },

    checkSelectedDatasets: function() {
        var checkboxes = this.$("input[type=checkbox]");
        this.collection.each(function(model, i) {
            if (this.selectedDatasets.get(model.id)) {
                checkboxes.eq(i).prop("checked", true);
            }
        }, this);
    },

    checkboxChanged: function(e) {
        var clickedBox = $(e.currentTarget);
        var index = this.$("> li input[type=checkbox]").index(clickedBox);
        var isChecked = clickedBox.prop("checked");

        if (isChecked) {
            this.selectedDatasets.add(this.collection.at(index));
        } else {
            this.selectedDatasets.remove(this.collection.at(index));
        }

        chorus.PageEvents.broadcast("tabularData:checked", this.selectedDatasets);
    },

    checkboxClicked: function(e) {
        e.stopPropagation();
    }
});
