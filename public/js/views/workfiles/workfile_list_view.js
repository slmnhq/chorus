chorus.views.WorkfileList = chorus.views.SelectableList.extend({
    templateName:"workfile_list",
    eventName: "workfile",

    filter:function (type) {
        this.collection.attributes.type = type;
        this.collection.fetch();
        return this;
    },

    postRender:function () {
        this.collection.each(function(workfile) {
            var view = new chorus.views.Workfile({model: workfile, activeWorkspace: this.options.activeWorkspace});
            $(this.el).append(view.render().el);
        }, this);

        this._super('postRender', arguments);
    }
});
