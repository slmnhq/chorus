chorus.views.KaggleUserList = chorus.views.SelectableList.extend({
    templateName: "kaggle/user_list",
    eventName: "kaggle_user",

    collectionModelContext: function(model) {
        return {
            kaggleRank: new Handlebars.SafeString(t('kaggle.rank', {rankHtml: chorus.helpers.spanFor(model.get('rank'), {'class': 'kaggle_rank'})})),
            avatarUrl: model.get("gravatarUrl") || "/images/kaggle/default_user.jpeg"
        }
    }
});
