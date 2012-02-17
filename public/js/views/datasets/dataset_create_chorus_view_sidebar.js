chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events : {
        "click button.create" : "createChorusView",
        "click a.remove" : "removeColumnClicked"
    },

    setup : function() {
        this.selectedHandle = chorus.PageEvents.subscribe("column:selected", this.addColumn, this);
        this.deselectedHandle = chorus.PageEvents.subscribe("column:deselected", this.removeColumn, this);
        this.chorusView = this.model.deriveChorusView()
    },

    postRender : function() {
        this.$("a.preview").data("parent", this);
        this.$("a.add_join").data("chorusView", this.chorusView)
    },

    addColumn: function(model) {
        this.$(".non_empty_selection").removeClass("hidden");
        this.$(".empty_selection").addClass("hidden");

        if (this.$(".columns li[data-cid='" + model.cid + "']").length === 0) {
            var $li = $(chorus.helpers.renderTemplate("dataset_create_chorus_view_sidebar_column_row",
                {cid: model.cid, name: model.get("name")}));
            $li.data("model", model);

            this.$(".non_empty_selection .columns").append($li);
        }

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
        var button = this.$("button.create");
        button.startLoading("actions.creating");

        var chorusView = new chorus.models.ChorusView({
            type: "CHORUS_VIEW",
            query: this.sql(),
            instanceId: this.model.get("instance").id,
            databaseName: this.model.get("databaseName"),
            schemaName: this.model.get("schemaName"),
            objectName: _.uniqueId("chorus_view_"),
            workspace: this.model.get("workspace"),
            objectType: "QUERY"
        });

        chorusView.bind("saved", function() {
            button.stopLoading();
            chorus.toast("dataset.chorusview.create_success");
            chorus.router.navigate(chorusView.showUrl(), true)
        });

        chorusView.bind("saveFailed", function() {
            button.stopLoading();
            chorus.toast("dataset.chorusview.create_fail");
        });

        chorusView.save();
    },

    whereClause: function() {
        return this.filters.whereClause();
    },

    selectClause: function() {
        var names = _.map(this.$(".columns li"), _.bind(function(li) {
            return chorus.Mixins.dbHelpers.safePGName(
                this.model.get("objectName"),
                $(li).data("model").get("name"))
        }, this));

        return "SELECT " + (names.length ? names.join(", ") : "*");
    },

    fromClause: function() {
        return "FROM " + chorus.Mixins.dbHelpers.safePGName(this.model.get("objectName"));
    },

    sql : function() {
        return [this.selectClause(), this.fromClause(), this.whereClause()].join("\n");
    }
});
