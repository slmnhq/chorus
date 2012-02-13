chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events : {
        "click button.create" : "createChorusView",
        "click a.remove" : "removeColumnClicked"
    },

    setup : function() {
        this.selectedHandle = chorus.PageEvents.subscribe("column:selected", this.addColumn, this);
        this.deselectedHandle = chorus.PageEvents.subscribe("column:deselected", this.removeColumn, this);
    },

    postRender : function() {
        this.$("a.preview").data("parent", this);
    },

    addColumn: function(model) {
        this.$(".non_empty_selection").removeClass("hidden");
        this.$(".empty_selection").addClass("hidden");

        var $li = $(chorus.helpers.renderTemplate("dataset_create_chorus_view_sidebar_column_row",
            {cid: model.cid, name: model.get("name")}));
        $li.data("model", model);

        this.$(".non_empty_selection .columns").append($li);
        this.$("button.create").prop("disabled", false);
    },

    removeColumn: function(model) {
        if (!model) {
            return;
        }

        this.$("li[data-cid='" + model.cid + "']").remove();
        if (this.$(".columns li").length == 0) {
            this.$(".non_empty_selection").addClass("hidden");
            this.$(".empty_selection").removeClass("hidden");
            this.$("button.create").prop("disabled", "disabled");
        }
    },

    removeColumnClicked: function(e) {
        e.preventDefault();
        var $li = $(e.target).closest("li");
        var model = $li.data("model");

        this.removeColumn(model);
        chorus.PageEvents.broadcast("column:removed", model);
    },

    createChorusView : function() {
        var params = {
            type: "CHORUS_VIEW",
            query: this.sql(),
            instanceId: this.model.get("instance").id,
            databaseName: this.model.get("databaseName"),
            schemaName: this.model.get("schemaName"),
            objectName: _.uniqueId("chorus_view_"),
            objectType: "QUERY"
        };

        var button = this.$("button.create");
        button.startLoading("loading");
        $.post("/edc/workspace/" + this.model.get("workspace").id + "/dataset", params,
            function(data) {
                button.stopLoading();
                if (data.status == "ok") {
                    chorus.toast("dataset.chorusview.create_success");
                } else {
                    chorus.toast("dataset.chorusview.create_fail");
                }
            }, "json");
    },

    whereClause: function() {
        return this.filters.whereClause();
    },

    selectClause: function() {
        var names = _.map(this.$(".columns li"), function(li) {
            return chorus.Mixins.dbHelpers.safePGName($(li).data("model").get("name"));
        });

        return "SELECT " + (names.length ? names.join(", ") : "*");
    },

    fromClause: function() {
        return "FROM " + this.model.get("objectName");
    },

    sql : function() {
        return [this.selectClause(), this.fromClause(), this.whereClause()].join("\n");
    }
});
