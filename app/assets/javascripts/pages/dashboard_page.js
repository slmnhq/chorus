chorus.pages.DashboardPage = chorus.pages.Base.extend({
    constructorName: "DashboardPage",

    crumbs:[
        { label:t("breadcrumbs.home") }
    ],
    helpId: "dashboard",

    setup:function () {
        this.collection = this.workspaceSet = new chorus.collections.WorkspaceSet();
        this.workspaceSet.attributes.showLatestComments = true;
        this.workspaceSet.sortAsc("name");
        this.workspaceSet.fetch();

        this.instanceSet = new chorus.collections.InstanceSet([], { hasCredentials: true });
        this.hadoopInstanceSet = new chorus.collections.HadoopInstanceSet([]);

        var mergeInstances = _.bind(function() {
                if(this.instanceSet.loaded && this.hadoopInstanceSet.loaded) {
                    var package = function(set) {
                        return _.map(set, function(instance) {
                            return new chorus.models.Base({ theInstance: instance })
                        });
                    }

                    var proxyInstances = package(this.instanceSet.models);
                    var proxyHadoopInstances = package(this.hadoopInstanceSet.models);

                    this.arraySet = new chorus.collections.Base();
                    this.arraySet.add(proxyInstances);
                    this.arraySet.add(proxyHadoopInstances);
                    this.arraySet.loaded = true;

                    this.mainContent = new chorus.views.Dashboard({ collection: this.workspaceSet, instanceSet: this.arraySet });
                    this.render();
                }
        }, this);

        this.instanceSet.fetch().success(mergeInstances);
        this.hadoopInstanceSet.fetch().success(mergeInstances);
        this.model = chorus.session.user();

        this.mainContent = new chorus.views.Dashboard({ collection: this.workspaceSet, instanceSet: this.arraySet });

        this.userSet = new chorus.collections.UserSet();
        this.userSet.bindOnce("loaded", function() {
            this.userCount = this.userSet.pagination.records;
            this.showUserCount()
        }, this);
        this.userSet.fetch();
    },

    showUserCount: function() {
        if (this.userCount) {
            this.$("#user_count a").text(t("dashboard.user_count", {count: this.userCount}));
            this.$("#user_count").removeClass("hidden");
        }
    },

    postRender:function () {
        this._super('postRender');
        this.$(".pill").insertAfter(this.$("#breadcrumbs"));
        this.$("#sidebar_wrapper").remove();
        this.showUserCount();
    }
});
