chorus.views.WorkfileListSidebar = chorus.views.Sidebar.extend({
    className:"workfile_list_sidebar",
    subviews:{
        '.tab_control': 'tabs'
    },

    setup:function () {
        this.tabs = new chorus.views.TabControl(["activity"]);
        chorus.PageEvents.subscribe("workfile:selected", this.setWorkfile, this);
        chorus.PageEvents.subscribe("workfile:deselected", this.unsetWorkfile, this);
    },

    setWorkfile:function (workfile) {
        this.model = this.workfile = workfile;
        if (this.workfile) {
            this.collection = this.workfile.activities();
            this.bindings.add(this.collection, "reset", this.render);
            this.collection.fetch();

            this.bindings.add(this.collection, "changed", this.render);
            this.bindings.add(this.workfile, "changed", this.render);

            this.tabs.activity = new chorus.views.ActivityList({
                collection:this.collection,
                additionalClass:"sidebar",
                displayStyle:['without_object', 'without_workspace']
            });
        } else {
            delete this.collection;
            delete this.tabs.activity;
        }

        this.render();
    },

    unsetWorkfile: function(){
        delete this.workfile;
        this.render();
    },

    additionalContext:function () {
        var ctx = {
            canUpdate: this.options.workspace && this.options.workspace.canUpdate(),
            activeWorkspace: this.options.workspace && this.options.workspace.get("active"),
            hideAddNoteLink: this.options.hideAddNoteLink
        };

        if (this.workfile) {
            var modifier = this.workfile.modifier();
            var attributes = _.extend({}, this.workfile.attributes);
            attributes.updatedBy = modifier.displayShortName();
            attributes.modifierUrl = modifier.showUrl();
            attributes.downloadUrl = this.workfile.downloadUrl();
            ctx.workfile = attributes;
        }

        return ctx;
    }
});
