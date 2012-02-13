chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events : {
        "click button.create" : "createChorusView",
        "click a.remove" : "removeColumnClicked"
    },

    postRender : function() {
        this.$("a.preview").data("parent", this);
        this.bind("column:selected", this.addColumn, this);
        this.bind("column:deselected", this.removeColumn, this);
    },

    addColumn: function(model) {
        this.$(".non_empty_selection").removeClass("hidden");
        this.$(".empty_selection").addClass("hidden");

        var $li = $(chorus.helpers.renderTemplate("dataset_create_chorus_view_sidebar_column_row",
            {cid: model.cid, name: model.get("name")}));
        $li.data("model", model);

        this.$(".non_empty_selection .columns").append($li);
    },

    removeColumn: function(model) {
        if (!model) {
            return;
        }

        this.$("li[data-cid='" + model.cid + "']").remove();
        if (this.$(".columns li").length == 0) {
            this.$(".non_empty_selection").addClass("hidden");
            this.$(".empty_selection").removeClass("hidden");
        }
    },

    removeColumnClicked: function(e) {
        e.preventDefault();
        var $li = $(e.target).closest("li");
        var model = $li.data("model");

        this.trigger("column:removed", model);
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

        $.post("/edc/workspace/" + this.model.get("workspace").id + "/dataset", params,
            function(data) {
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
            return $(li).data("model").get("name");
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
