chorus.models.TableauWorkbook = chorus.models.Base.extend({
    constructorName: "TableauWorkbook",
    entityType: "tableau_workbook",
    paramsToSave: ['name'],

    declareValidations:function (newAttrs) {
        this.require('name', newAttrs);
    },

    url: function() {
        return "/datasets/" + this.get('dataset').get('id') + "/tableau_workbook";
    }
});
