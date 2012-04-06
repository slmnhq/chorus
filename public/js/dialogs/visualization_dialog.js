chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className:"visualization",

    subviews:{
        ".tabledata": "tableData",
        ".filter_options": "filterWizard"
    },

    events:{
        "click a.show": "showTabularData",
        "click a.hide": "hideTabularData",
        "click a.show_options": "showFilterOptions",
        "click a.hide_options": "hideFilterOptions",
        "click button.close_dialog": "closeModal"
    },

    setup: function () {
        this.type = this.options.chartOptions.type;
        this.title = t("visualization.title", {name: this.options.chartOptions.name});
        this.filters = this.options.filters.clone();
        this.filterWizard = new chorus.views.DatasetFilterWizard({collection: this.filters, columnSet: this.options.columnSet});
        this.tableData = new chorus.views.ResultsConsole({shuttle: false, hideExpander: true, footerSize: _.bind(this.footerSize, this)});
        this.bindings.add(this.filters, "add remove change", this.filtersChanged, this);
    },

    footerSize: function() {
        return this.$('.modal_controls').outerHeight(true);
    },

    postRender: function () {
        this.tableData.showResultTable(this.task);
        this.tableData.$('.expander_button').remove();
        this.$('.chart_icon.' + this.type).addClass("selected");
        chorus.menu(this.$('button.save'), {
            content: this.$(".save_options"),
            orientation: "right",
            contentEvents: {
                "a.save_as_workfile": _.bind(this.saveAsWorkfile, this),
                "a.save_as_note": _.bind(this.saveAsNoteAttachment, this),
                "a.save_to_desktop": _.bind(this.saveToDesktop, this)
            }
        });
    },

    onExecutionComplete: function () {
        this.launchModal();

        this.drawChart();
    },

    drawChart: function () {
        if (this.isValidData()) {
            this.chart = new chorus.views.visualizations[_.capitalize(this.type)]({model:this.task});
            this.subviews[".chart_area"] = "chart";
        } else {
            this.displayEmptyChartWarning()
        }
        this.render();
    },

    displayEmptyChartWarning: function() {
        this.emptyDataWarning = new chorus.views.visualizations.EmptyDataWarning()
        this.subviews[".chart_area"] = "emptyDataWarning";
    },

    isValidData: function() {
        return !_.isEmpty(this.task.get("rows"));
    },

    makeFilename: function() {
        return this.sanitizeFilename(this.options.chartOptions.name + "-" + this.options.chartOptions.type) + ".png";
    },

    makeSvgData: function() {
        var svg = this.$(".chart_area.visualization svg")[0];
        if (BrowserDetect.browser != "Explorer") {
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        }
        return new XMLSerializer().serializeToString(svg);
    },

    createDownloadForm: function () {
        var form = $("<form action='/downloadChart.jsp' method='post'></form>");
        form.append($("<input name='svg' type='hidden'/>").val(this.makeSvgData()));
        form.append($("<input name='chart-name' type='hidden'/>").val(this.options.chartOptions.name));
        form.append($("<input name='chart-type' type='hidden'>/").val(this.options.chartOptions.type));
        return form;
    },

    saveWorkfile: function(workspace) {
        this.$('button.save').startLoading("actions.saving");

        var workspaceId = workspace ? workspace.get("id") : this.task.get("workspaceId");

        this.workfile = new chorus.models.Workfile({
            workspaceId: workspaceId,
            source: "visualization",
            svgData: this.makeSvgData(),
            fileName: this.makeFilename()
        });
        this.workfile.save();
        this.workfile.bindOnce('saved', this.onWorkfileSaved, this);
    },

    onWorkfileSaved: function() {
        this.$('button.save').stopLoading();
        chorus.toast("dataset.visualization.toast.workfile_from_chart", {fileName: this.workfile.get("fileName")})
    },

    additionalContext:function () {
        return {
            filterCount: this.filters.length,
            chartType:t("dataset.visualization.names." + this.type),
            workspaceId: this.task.get("workspaceId"),
            hasChart: !!this.chart,
            hasWorkspace: !!this.task.get("workspaceId")
        }
    },

    showFilterOptions: function(e) {
        e && e.preventDefault();

        this.$("a.show_options").addClass("hidden");
        this.$("a.hide_options").removeClass("hidden");
        this.$(".filter_options").removeClass("hidden");
    },

    hideFilterOptions: function(e) {
        e && e.preventDefault();

        this.$("a.show_options").removeClass("hidden");
        this.$("a.hide_options").addClass("hidden");
        this.$(".filter_options").addClass("hidden");
    },

    filtersChanged: function() {
        this.$(".overlay").removeClass("hidden");
        this.$("button.refresh").removeClass("hidden");
        this.$("button.revert").removeClass("hidden");
        this.$("button.save").addClass("hidden");
        this.$("button.close_dialog").addClass("hidden");

    },

    showTabularData:function (e) {
        e && e.preventDefault();
        this.$('.results_console').removeClass("hidden");
        this.$(".modal_controls a.hide").removeClass("hidden");
        this.$(".modal_controls a.show").addClass("hidden");
        this.recalculateScrolling();
    },

    hideTabularData:function (e) {
        e && e.preventDefault();
        this.$('.results_console').addClass("hidden")
        this.$(".modal_controls a.show").removeClass("hidden");
        this.$(".modal_controls a.hide").addClass("hidden");
    },

    saveToDesktop:function (event) {
        event.preventDefault();
        var form = this.createDownloadForm()
        form.hide();
        $("body").append(form)
        form.submit();
    },

    saveAsNoteAttachment: function(event) {
        event.preventDefault();

        var launchElement = $(event.target);
        this.notesNewDialog = new chorus.dialogs.VisualizationNotesNew({
            pageModel: this.model,
            launchElement: launchElement,
            attachVisualization: {
                fileName: this.makeFilename(),
                svgData: this.makeSvgData()
            }
        })
        this.launchSubModal(this.notesNewDialog);
    },

    saveAsWorkfile: function(e) {
        e.preventDefault();

        if (!this.task.get("workspaceId")) {
            this.workspacePicker = new chorus.dialogs.VisualizationWorkspacePicker();
            this.launchSubModal(this.workspacePicker);
            this.workspacePicker.bindOnce("workspace:selected", this.saveWorkfile, this);
        } else {
            this.saveWorkfile();
        }
    },

    sanitizeFilename: function(fileName) {
        return fileName.replace(/[^A-Z0-9_\-.]/gi, '')
    }
});
