;(function($, ns) {
    var types = [
        "NOTE",
        "DEFAULT",
        "WORKSPACE_CREATED",
        "WORKSPACE_DELETED",
        "WORKSPACE_MAKE_PRIVATE",
        "WORKSPACE_MAKE_PUBLIC",
        "MEMBERS_ADDED",
        "WORKFILE_CREATED",
        "USER_ADDED"
    ];

    var compiledTemplates = {};
    _.each(types, function(type) {
        compiledTemplates[type] = Handlebars.compile(t("activity_stream.header.html." + type));
    });

    ns.views.Activity = chorus.views.Base.extend({
        className : "activity",

        context : function() {
            var presenter = new chorus.presenters.Activity(this.model)
            return _.extend({}, presenter, { headerHtml : this.headerHtml(presenter) })
        },

        headerHtml : function(presenter) {
            var type = this.model.get("type");
            var template = compiledTemplates[type] || compiledTemplates['DEFAULT'];

            return template(presenter.header);
        }
    });
})(jQuery, chorus);
