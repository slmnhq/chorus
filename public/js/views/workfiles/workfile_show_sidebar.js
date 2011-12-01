(function($, ns) {
    ns.WorkfileShowSidebar = chorus.views.Base.extend({
        className : "workfile_show_sidebar",

        additionalContext : function() {
            return {
                updatedAt : new Date(this.model.get("lastUpdatedStamp")).toString("MMMM d"),
                updatedBy : [this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
                modifierUrl : this.model.modifier().showUrl()
            }
        }
    });
})(jQuery, chorus.views);
