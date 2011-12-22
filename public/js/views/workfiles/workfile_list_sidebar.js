(function($, ns) {
    ns.views.WorkfileListSidebar = chorus.views.Base.extend({
        className : "workfile_list_sidebar",

        setup: function() {
            this.bind("workfile:selected", this.setWorkfile, this);
        },

        setWorkfile: function(workfile) {
            this.workfile = workfile;
            this.collection = this.workfile.activities();
            this.collection.fetch();

            this.collection.bind("changed", this.render, this);
            this.workfile.bind("changed", this.render, this);

            this.activityList = new ns.views.ActivityList({ collection : this.collection, headingText : t("workfiles.sidebar.activity"), additionalClass : "sidebar" });
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
            var ctx = {canUpdate : this.model.canUpdate()};
            if (this.workfile) {
                var attributes = _.extend({}, this.workfile.attributes);
                attributes.updatedBy = [this.workfile.attributes.modifiedByFirstName, this.workfile.attributes.modifiedByLastName].join(' ');
                attributes.modifierUrl = this.workfile.modifier().showUrl();
                attributes.downloadUrl = this.workfile.downloadUrl();
                ctx.workfile = attributes;
            }

            return ctx;
        }
    });
})(jQuery, chorus);
