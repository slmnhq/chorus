chorus.views.LoadingSection = chorus.views.Base.extend({
    constructorName: "LoadingSectionView",
    templateName:"loading_section",

    postRender:function () {
        if (this.options.delay) {
            _.delay(_.bind(this.showSpinner, this), this.options.delay);
        } else {
            this.showSpinner();
        }
    },

    showSpinner:function () {
        this.$('.loading_spinner').startLoading();
        this.$(".loading_text").removeClass("hidden");
    },

    makeLoadingSectionView:null
})

