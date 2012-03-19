chorus.views.TabularDataContentDetails = chorus.views.Base.extend({
    className: "tabular_data_content_details",
    persistent: true,

    subviews: {
        ".data_preview": "resultsConsole",
        ".filters": "filterWizardView"
    },

    events: {
        "click .preview": "dataPreview",
        "click .create_chart .cancel": "cancelVisualization",
        "click .create_chorus_view .cancel": "cancelChorusView",
        "click .edit_chorus_view .cancel": "cancelEditChorusView",
        "click .edit_chorus_view .save": "saveChorusView",
        "click .chart_icon": "selectVisualization",
        "click .close_errors": "closeError",
        "click .view_error_details": "viewErrorDetails",
        "click a.select_all": "triggerSelectAll",
        "click a.select_none": "triggerSelectNone",
        "mouseenter .chart_icon": "showTitle",
        "mouseleave .chart_icon": "showSelectedTitle",
        "click button.visualize": "startVisualizationWizard",
        "click button.derive": "startCreateChorusViewWizard",
        "click button.edit": "startEditChorusViewWizard"
    },

    setup: function() {
        chorus.PageEvents.subscribe("action:closePreview", this.closeDataPreview, this);

        this.tabularData = this.options.tabularData;
        this.resultsConsole = new chorus.views.ResultsConsole({titleKey: "dataset.data_preview", enableClose: true});
        this.filterWizardView = new chorus.views.DatasetFilterWizard({collection: this.collection});

        this.statistics = this.tabularData.statistics();
        this.statistics.fetchIfNotLoaded();

        this.requiredResources.add(this.statistics);
        this.bindings.add(this.collection, "add remove", this.updateColumnCount);
    },

    dataPreview: function(e) {
        e.preventDefault();

        this.$(".column_count").addClass("hidden");
        this.$(".edit_chorus_view_info").addClass("hidden");
        this.$(".data_preview").removeClass("hidden");
        if (!this.options.inEditChorusView) {
            this.resultsConsole.execute(this.tabularData.preview());
        } else {
            this.resultsConsole.execute(this.tabularData.preview(this.options.inEditChorusView), true);
        }
    },

    closeDataPreview: function() {
        if (!this.options.inEditChorusView) {
            this.$(".column_count").removeClass("hidden");
            this.$(".data_preview").addClass("hidden");
        } else {
            this.$(".edit_chorus_view_info").removeClass("hidden");
            this.$(".data_preview").addClass("hidden");
        }
    },

    postRender: function() {
        if (this.options.inEditChorusView) {
            this.showEditChorusViewWizard();
        }

        if (this.options.$columnList) {
            chorus.search({
                input: this.$("input.search"),
                list: this.options.$columnList
            });
        }

        if(this.collection.serverErrors && this.collection.serverErrors.length){
            this.showError(this.collection, chorus.alerts.Error);
        }
    },

    triggerSelectAll: function(e) {
        e && e.preventDefault();
        chorus.PageEvents.broadcast("column:select_all");
    },

    triggerSelectNone: function(e) {
        e && e.preventDefault();
        chorus.PageEvents.broadcast("column:select_none");
    },

    startVisualizationWizard: function() {
        this.$('.chart_icon:eq(0)').click();
        this.$('.column_count').addClass('hidden');
        this.$('.info_bar').removeClass('hidden');
        this.$('.definition').addClass("hidden")
        this.$('.create_chart').removeClass("hidden");
        this.$(".filters").removeClass("hidden");
        this.filterWizardView.options.showAliasedName = false;
        this.filterWizardView.resetFilters();
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
        chorus.PageEvents.broadcast('cancel:sidebar', $(e.target).data('type'));
    },

    startCreateChorusViewWizard: function() {
        this.trigger("transform:sidebar", "chorus_view");
        this.$('.chorusview').addClass("selected");
        this.$('.definition').addClass("hidden")
        this.$('.create_chart').addClass("hidden");
        this.$('.create_chorus_view').removeClass("hidden");
        this.$('.chorus_view_info').removeClass("hidden");
        this.$('.column_count').addClass("hidden");
        this.$('.filters').removeClass("hidden");
        this.filterWizardView.options.showAliasedName = true;
        this.filterWizardView.resetFilters();

        this.$(".chorus_view_info input.search").trigger("textchange");
    },

    cancelChorusView: function(e) {
        e.preventDefault();
        chorus.PageEvents.broadcast('cancel:sidebar', 'chorus_view');
        this.$('.definition').removeClass("hidden")
        this.$('.create_chorus_view').addClass("hidden");
        this.$(".filters").addClass("hidden");
        this.$('.column_count').removeClass("hidden")
        this.$('.chorus_view_info').addClass('hidden');

        this.$(".column_count input.search").trigger("textchange");
    },

    startEditChorusViewWizard: function() {
        this.trigger("transform:sidebar", "edit_chorus_view");
        this.showEditChorusViewWizard();
        this.trigger("dataset:edit");
    },

    showEditChorusViewWizard: function() {
        this.$(".edit_chorus_view").removeClass("hidden");
        this.$(".create_chorus_view").addClass("hidden");
        this.$(".create_chart").addClass("hidden");
        this.$(".definition").addClass("hidden");

        this.$(".edit_chorus_view_info").removeClass("hidden");
        this.$(".column_count").addClass("hidden");
    },

    cancelEditChorusView: function(e) {
        e.preventDefault();
        this.$(".edit_chorus_view").addClass("hidden");
        this.$(".edit_chorus_view_info").addClass("hidden");
        this.$(".column_count").removeClass("hidden");
        this.$(".definition").removeClass("hidden");
        chorus.PageEvents.broadcast('cancel:sidebar', 'chorus_view');
        this.trigger("dataset:cancelEdit");
        this.tabularData.set({query: this.tabularData.initialQuery});
    },

    saveChorusView: function() {
        this.trigger("dataset:saveEdit");
    },

    closeError: function(e) {
        e && e.preventDefault();
        this.$(".dataset_errors").addClass("hidden");
    },

    viewErrorDetails: function(e) {
        e.preventDefault();

        var alert = new this.alertClass({model: this.taskWithErrors});
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
    },

    additionalContext: function() {
        return {
            definition: this.tabularData.isChorusView() ? this.tabularData.get("query") : this.statistics.get("definition"),
            isChorusView: this.tabularData.isChorusView(),
            showDerive: !this.tabularData.isChorusView() && !this.options.hideDeriveChorusView
        }
    },

    showError: function(task, alertClass) {
        this.$('.dataset_errors').removeClass('hidden')
        this.alertClass = alertClass
        this.taskWithErrors = task
    },

    updateColumnCount: function() {
        this.$('.count').text(t("dataset.column_count", {count: this.collection.length}))
    }
});
