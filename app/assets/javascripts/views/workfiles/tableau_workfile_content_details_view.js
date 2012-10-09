chorus.views.TableauWorkfileContentDetails = chorus.views.WorkfileContentDetails.extend({
    templateName:"tableau_workfile_content_details",

    additionalContext: function() {
        return {
            workbookUrl: this.model.get('workbookUrl')
        }
    }
});