chorus.pages.InstanceIndexPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.instances") }
    ],
    helpId: "instances",

    setup:function () {
        var greenplumInstances = new chorus.collections.InstanceSet();
        var hadoopInstances = new chorus.collections.HadoopInstanceSet();
        var gnipInstances = new chorus.collections.GnipInstanceSet();
        greenplumInstances.fetchAll();
        hadoopInstances.fetchAll();
        gnipInstances.fetchAll();

        this.dependOn(greenplumInstances, this.setPreselection);

        var options = {
            greenplumInstances: greenplumInstances,
            hadoopInstances: hadoopInstances,
            gnipInstances: gnipInstances
        };

        this.mainContent = new chorus.views.MainContentView({
            contentHeader: new chorus.views.StaticTemplate("default_content_header", {title:t("instances.title_plural")}),
            contentDetails: new chorus.views.InstanceIndexContentDetails(options),
            content: new chorus.views.InstanceList(options)
        });

        this.sidebar = new chorus.views.InstanceListSidebar();

        chorus.PageEvents.subscribe("instance:selected", this.setModel, this);
    },

    setPreselection: function() {
        if (this.pageOptions && this.pageOptions.selectId) {
            this.mainContent.content.selectedInstanceId = this.pageOptions.selectId;
            this.mainContent.content.render();
        }
    },

    setModel:function (instance) {
        this.model = instance;
    }
});
