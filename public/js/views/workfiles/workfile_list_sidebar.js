(function($, ns) {
    ns.WorkfileListSidebar = chorus.views.Base.extend({
        className : "workfile_list_sidebar",

        setup: function() {
            this.bind("workfile:selected", this.setWorkfile, this);
        },

        setWorkfile: function(workfile) {
            this.workfile = workfile;

            var self = this;
            this.workfile.fetch({
                silent : true,
                success : function(){ self.setDownloadUrl(arguments)}

            });
            this.render();
        },

        additionalContext
            :
            function() {
                if (this.workfile) {
                    var attributes = _.extend({}, this.workfile.attributes);
                    attributes["updatedAt"] = new Date(attributes.lastUpdatedStamp).toString("MMMM d")
                    attributes["updatedBy"] = [this.workfile.attributes.modifiedByFirstName, this.workfile.attributes.modifiedByLastName].join(' '),
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
