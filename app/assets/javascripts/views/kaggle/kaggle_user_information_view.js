chorus.views.KaggleUserInformation = chorus.views.Base.extend({
    constructorName: "KaggleUserInformation",
    templateName: "kaggle/user_information",

    additionalContext: function() {
        return {
            pastCompetitions: this.model.get('pastCompetitionTypes'),
            favoriteTechnique: this.model.get('favoriteTechnique'),
            favoriteSoftware: this.model.get('favoriteSoftware')
        }
    }
});