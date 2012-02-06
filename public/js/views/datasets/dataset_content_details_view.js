chorus.views.DatasetContentDetails = chorus.views.Base.extend({
    className:"dataset_content_details",

    subviews : {
        ".data_preview" : "resultsConsole",
        ".filters" : "filterWizardView"
    },

    events : {
        "click .preview" : "dataPreview",
        "click .create_chart .cancel" : "cancelVisualization",
        "click .chart_icon" : "selectVisualization",
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
    
    postRender:function () {
        var self = this;
        chorus.menu(this.$('.transform'), {
            content:this.$(".transform_options").html(),
            orientation:"left",
            contentEvents:{
                '.visualize':_.bind(this.startVisualizationWizard, this)
            }
        });
    },

    startVisualizationWizard : function() {
        this.$('.chart_icon:eq(0)').click();
        this.$('.column_count').addClass('hidden');
        this.$('.info_bar').removeClass('hidden');
        this.$('.definition').addClass ("hidden")
        this.$('.create_chart').removeClass("hidden");
        this.$(".filters").removeClass("hidden");
        this.filterWizardView.render();
    },

    selectVisualization: function(e) {
        this.trigger("transform:visualize", $(e.target).data('chart_type'))
        $(e.target).siblings('.chart_icon').removeClass('selected');
        $(e.target).addClass('selected');
        this.showTitle(e);
    },

    cancelVisualization: function(e) {
        e.preventDefault();
        this.$('.definition').removeClass ("hidden")
        this.$('.create_chart').addClass("hidden");
        this.$(".filters").addClass("hidden");
        this.$('.column_count').removeClass ("hidden")
        this.$('.info_bar').addClass('hidden');
        this.trigger("cancel:visualize");
    },

    showTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        $(e.target).siblings('.title.'+ $(e.target).data('chart_type')).removeClass('hidden');
    },

    showSelectedTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        var type = this.$('.selected').data('chart_type');
        $(e.target).siblings('.title.'+ type).removeClass('hidden');
    }
});