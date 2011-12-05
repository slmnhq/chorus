(function($, ns) {
    ns.WorkfileListSidebar = chorus.views.Base.extend({
        className : "workfile_list_sidebar",

        setup: function() {
            this.bind("workfile:selected", this.setWorkfile, this);
        },

        setWorkfile: function(workfile) {
            this.workfile = workfile;
            this.workfile.bind("changed", this.render, this);

            var self = this;
            this.workfile.fetch({
                silent : true,
                success : function() {
                    self.setDownloadUrl(arguments)
                }

            });

            this.activityList = new ns.ActivityList({ collection : ns.ActivityList.cannedActivitySetFor(this.workfile) });
            this.render();
        },

        postRender : function() {
            if (this.activityList) {
            this.activityList.el = this.$(".activities")
            this.activityList.delegateEvents()
            this.activityList.render();
            }
        },

        additionalContext : function() {
            if (this.workfile) {
                var attributes = _.extend({}, this.workfile.attributes);
                attributes["updatedBy"] = [this.workfile.attributes.modifiedByFirstName, this.workfile.attributes.modifiedByLastName].join(' ');
                attributes["modifierUrl"] = this.workfile.modifier().showUrl()
                return { workfile: attributes };
            } else {
                return {};
            }
        }
        ,

        setDownloadUrl : function(resp, status, xhr) {
            var downloadUrl = "/edc/workspace/" + this.workfile.get("workspaceId") + "/workfile/" + this.workfile.get("id") + "/file/" + this.workfile.get("versionFileId") + "?download=true"
            this.$('a.download').attr("href", downloadUrl);
        }

    })
        ;
})
    (jQuery, chorus.views);
