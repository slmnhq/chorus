chorus.models.TableauWorkbook = chorus.models.Base.extend({
    constructorName: "TableauWorkbook",
    entityType: "tableau_workbook",

    url: function() {
        return "/datasets/" + this.get('dataset').get('id') + "/tableau_workbook";
    }
});
