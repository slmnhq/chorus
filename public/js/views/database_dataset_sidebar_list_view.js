chorus.views.DatabaseDatasetSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseDatasetSidebarListView",
    className:"database_dataset_sidebar_list",
    useLoadingSection: true,

    events: {
        "click li a":"datasetSelected"
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.databaseObjects();
        this.collection.fetchAllIfNotLoaded();
        this.bindings.add(this.collection, "reset", this.render);
    },

    datasetSelected: function (e) {
        e.preventDefault();
        var li = $(e.currentTarget).closest("li"),
            type = li.data("type"),
            name = li.data("name");

        var dataset = this.collection.findWhere({ type:type, objectName: name });
        this.trigger("datasetSelected", dataset);
    },

    postRender: function() {
        this._super("postRender")

        this.$("li").draggable({
            cursor: "move",
            containment: "window",
            appendTo: "body",
            helper: this.dragHelper
        });
    },

    dragHelper : function(e) {
        return '<div class="drag_helper">' + $(e.currentTarget).data("name") + '</div>'
    },

    additionalContext:function () {
        this.collection && this.collection.models.sort(function (a, b) {
            return naturalSort(a.get("objectName").toLowerCase(), b.get("objectName").toLowerCase());
        });

        return this._super("additionalContext", arguments);
    },

    collectionModelContext:function (model) {
        return {
            iconUrl: model.iconUrl({size:"medium"}),
            type: model.get("type"),
            name: model.get("objectName"),
            cid: model.cid,
            fullName: model.toText()
        }
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});


