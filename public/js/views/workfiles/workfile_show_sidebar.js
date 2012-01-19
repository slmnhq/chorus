(function($, ns) {
    ns.views.WorkfileShowSidebar = ns.views.Sidebar.extend({
        className : "workfile_show_sidebar",

        events : {
            "click a.version_list" : "displayVersionList"
        },
        subviews : {
            '.activity_list' : 'activityList',
            '.tab_control' : 'tabControl'
        },

        setup : function() {
            this.collection = this.model.activities();
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.ActivityList({
                collection : this.collection,
                headingText : t("workfile.content_details.activity"),
                additionalClass : "sidebar",
                displayStyle : ['without_object', 'without_workspace']
            });

            this.tabControl = new chorus.views.TabControl([{name: 'activity', selector: ".activity_list"}]);

            this.allVersions = this.model.allVersions();
            this.versionList = new ns.views.WorkfileVersionList({collection : this.allVersions});
            this.allVersions.fetch();
            this.model.bind("invalidated", this.allVersions.fetch, this.allVersions);
            this.allVersions.bind("changed", this.render, this);
        },

        postRender : function() {
            var versionList = this.versionList;
            this.$("a.version_list").qtip({
                    content: {
                        text : function() {
                            return $(versionList.render().el);
                        }
                    },
                    show: 'click',
                    hide: 'unfocus',
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    style: {
                        classes: "tooltip-white",
                        tip: {
                            width: 20,
                            height: 15
                        }
                    }
            });
        },

        displayVersionList : function(e) {
            e.preventDefault();
        },

        additionalContext : function(ctx) {
            return {
                updatedBy : [this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
                modifierUrl : this.model.modifier().showUrl(),
                downloadUrl : this.model.downloadUrl()
            }
        }
    });
})(jQuery, chorus);
