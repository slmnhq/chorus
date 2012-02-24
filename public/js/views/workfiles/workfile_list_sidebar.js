chorus.views.WorkfileListSidebar = chorus.views.Sidebar.extend({
    className:"workfile_list_sidebar",
    subviews:{
        '.activities':'activityList'
    },

    setup:function () {
        this.bind("workfile:selected", this.setWorkfile, this);
    },

    setWorkfile:function (workfile) {
        this.workfile = workfile;
        if (this.workfile) {
            this.collection = this.workfile.activities();
            this.collection.bind("reset", this.render, this)
            this.collection.fetch();

            this.collection.bind("changed", this.render, this);
            this.workfile.bind("changed", this.render, this);

            this.activityList = new chorus.views.ActivityList({
                collection:this.collection,
                additionalClass:"sidebar",
                displayStyle:['without_object', 'without_workspace']
            });

            this.activityList.bind("content:changed", this.recalculateScrolling, this)

        } else {
            delete this.collection;
            delete this.activityList;
        }

        this.render();
    },

    additionalContext:function () {
        var ctx = { canUpdate: this.model && this.model.canUpdate() , hideAddNoteLink: this.options.hideAddNoteLink };
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
