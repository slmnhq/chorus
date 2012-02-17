chorus.views.DatasetListSidebar = chorus.views.Sidebar.extend({
    className:"dataset_list_sidebar",

    events: {
        "click .no_credentials a.add_credentials": "launchAddCredentialsDialog"
    },

    subviews:{
        '.activity_list':'activityList',
        '.tab_control':'tabControl'
    },

    setup:function () {
        chorus.PageEvents.subscribe("dataset:selected", this.setDataset, this);
        this.tabControl = new chorus.views.TabControl([
            {name:'activity', selector:".activity_list"},
            {name:'statistics', selector:".statistics_detail"}
        ]);
    },

    setDataset:function (dataset) {
        this.resource = dataset;
        if (dataset) {
            this.statistics = dataset.statistics();
            this.statistics.fetchIfNotLoaded();
            this.statistics.onLoaded(this.render, this);

            var activities = dataset.activities();
            activities.fetch();
            this.activityList = new chorus.views.ActivityList({
                collection: activities,
                additionalClass:"sidebar",
                displayStyle: this.options.browsingSchema ? ['default'] : ['without_object']
            });

            this.activityList.bind("content:changed", this.recalculateScrolling, this)
        } else {
            delete this.statistics;
            delete this.activityList;
        }

        this.render();
    },

    additionalContext:function () {
        var ctx = {
            typeString: this.datasetType(this.resource),
            browsingSchema: this.options.browsingSchema
        }

        if (this.resource) {
            ctx.entityType = this.resource.entityType;

            if (this.resource.get("hasCredentials") === false) {
                ctx.noCredentials = true;
                ctx.noCredentialsWarning = t("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
            }

            if(this.resource.get("workspace")) {
                ctx.workspaceId = this.resource.get("workspace").id;
            }
            ctx.displayEntityType = this.resource.metaType();
        }

        if (this.statistics) {
            ctx.statistics = this.statistics.attributes;
            if (ctx.statistics.rows === 0) {
                ctx.statistics.rows = "0"
            }

            if (ctx.statistics.columns === 0) {
                ctx.statistics.columns = "0"
            }
        }

        return ctx;
    },

    launchAddCredentialsDialog: function(e) {
        e && e.preventDefault();
        new chorus.dialogs.InstanceAccount({pageModel:this.resource.instance(), title: t("instances.sidebar.add_credentials"), reload:true}).launchModal();
    },

    datasetType:function (dataset) {
        if (!dataset) { return ""; }

        var keys = ["dataset.types", dataset.get("type")];
        if (dataset.get("objectType")) { keys.push(dataset.get("objectType")); }
        var key = keys.join(".");
        return t(key);
    }
});
