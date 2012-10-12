chorus.views.KaggleUserInformation = chorus.views.Base.extend({
    constructorName: "KaggleUserInformation",
    templateName: "kaggle/user_information",

    additionalContext: function() {
        var pastCompetitions = this.model.get('pastCompetitionTypes');
        return {
            firstPastCompetition: pastCompetitions[0],
            otherPastCompetitions: _.rest(pastCompetitions)
        }
    }
});