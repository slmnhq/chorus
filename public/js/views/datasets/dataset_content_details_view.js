chorus.views.DatasetContentDetails = chorus.views.Base.extend({
    className:"dataset_content_details",

    subviews : {
        ".data_preview" : "resultsConsole",
        ".filters" : "filterWizardView"
    },

    events : {
        "click .preview" : "dataPreview",
        "click .create_chart .cancel" : "cancelVisualization",
        "click .create_chorus_view .cancel" : "cancelChorusView",
        "click .chart_icon" : "selectVisualization",
        "click .close_errors": "closeError",
        "click .view_error_details": "viewErrorDetails",
        "mouseenter .chart_icon" : "showTitle",
        "mouseleave .chart_icon" : "showSelectedTitle"
    },

    setup: function() {
        this.dataset = this.options.dataset;
        this.resultsConsole = new chorus.views.ResultsConsole({titleKey: "dataset.data_preview", enableClose: true});
        this.resultsConsole.bind("action:close", this.closeDataPreview, this);
        this.filterWizardView = new chorus.views.DatasetFilterWizard({collection : this.collection});
    },

    dataPreview : function(e) {
        e.preventDefault();

        this.$(".column_count").addClass("hidden");
        this.$(".data_preview").removeClass("hidden");

        this.resultsConsole.execute(this.dataset.preview());
    },

    closeDataPreview : function() {
        this.$(".column_count").removeClass("hidden");
        this.$(".data_preview").addClass("hidden");
    },

    onFetchComplete: function() {
        this.resultsConsole.trigger("file:executionCompleted", this.preview);
    },

    postRender:function () {
        var self = this;
        chorus.menu(this.$('.transform'), {
            content:this.$(".transform_options").html(),
            orientation:"left",
            contentEvents:{
                '.visualize':_.bind(this.startVisualizationWizard, this),
                '.derive': _.bind(this.startCreateChorusViewWizard, this)
            }
        });
    },

    startVisualizationWizard : function() {
        this.$('.chart_icon:eq(0)').click();
        this.$('.column_count').addClass('hidden');
        this.$('.info_bar').removeClass('hidden');
        this.$('.definition').addClass("hidden")
        this.$('.create_chart').removeClass("hidden");
        this.$(".filters").removeClass("hidden");
        this.filterWizardView.render();
    },

    selectVisualization: function(e) {
        this.trigger("transform:sidebar", $(e.target).data('chart_type'))
        $(e.target).siblings(".cancel").data("type", $(e.target).data('chart_type'));
        $(e.target).siblings('.chart_icon').removeClass('selected');
        $(e.target).addClass('selected');
        this.showTitle(e);
    },

    cancelVisualization: function(e) {
        e.preventDefault();
        this.$('.definition').removeClass("hidden")
        this.$('.create_chart').addClass("hidden");
        this.$(".filters").addClass("hidden");
        this.$('.column_count').removeClass("hidden")
        this.$('.info_bar').addClass('hidden');
        this.trigger("cancel:sidebar", $(e.target).data('type'));
    },

    startCreateChorusViewWizard: function() {
        this.trigger("transform:sidebar", "chorus_view");
        this.$(".cancel").data("type", "chorus_view");
        this.$('.chorusview').addClass("selected");
        this.$('.definition').addClass("hidden")
        this.$('.create_chart').addClass("hidden");
        this.$('.create_chorus_view').removeClass("hidden");
        this.$('.chorus_view_info').removeClass("hidden");
        this.$('.column_count').addClass("hidden");
        this.$('.filters').removeClass("hidden");
    },

    cancelChorusView: function(e) {
        e.preventDefault();
        this.trigger("cancel:sidebar", $(e.target).data('type'));
        this.$('.definition').removeClass("hidden")
        this.$('.create_chorus_view').addClass("hidden");
        this.$(".filters").addClass("hidden");
        this.$('.column_count').removeClass("hidden")
        this.$('.chorus_view_info').addClass('hidden');
    },

    closeError: function(e) {
        e.preventDefault();
        this.$(".sql_errors").addClass("hidden");
    },

    viewErrorDetails: function(e) {
        e.preventDefault();

        var alert = new chorus.alerts.ExecutionError({model: this.task});
        alert.launchModal();
        $(".errors").addClass("hidden");
    },

    showTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        $(e.target).siblings('.title.' + $(e.target).data('chart_type')).removeClass('hidden');
    },

    showSelectedTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        var type = this.$('.selected').data('chart_type');
        $(e.target).siblings('.title.' + type).removeClass('hidden');
    }
});