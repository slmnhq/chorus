(function($, ns) {
    ns.WorkfileListSidebar = chorus.views.Base.extend({
        className : "workfile_list_sidebar",

        setup: function() {
            this.bind("workfile:selected", this.setWorkfile, this);
        },

        setWorkfile: function(workfile) {
            this.workfile = workfile;
            this.render();
        },

        additionalContext: function() {
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
    });
})(jQuery, chorus.views);
