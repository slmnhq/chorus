(function($, ns) {
    ns.WorkfileListSidebar = chorus.views.Base.extend({
        className : "workfile_list_sidebar",

        setup: function() {
            this.bind("workfile:selected", this.setWorkfile, this);
        },

        setWorkfile: function(workfile) {
            this.workfile = workfile;
            this.workfile.bind("changed", this.render, this);

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
                attributes.updatedBy = [this.workfile.attributes.modifiedByFirstName, this.workfile.attributes.modifiedByLastName].join(' ');
                attributes.modifierUrl = this.workfile.modifier().showUrl();
                attributes.downloadUrl = this.workfile.downloadUrl();
                return {
                    workfile: attributes
                };
            } else {
                return {};
            }
        }
    });
})(jQuery, chorus.views);
