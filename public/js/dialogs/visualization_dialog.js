chorus.dialogs.Visualization = chorus.dialogs.Base.extend({
    className:"visualization",

    subviews:{
        ".tabledata":"chartData"
    },

    events:{
        "click a.show":"showTabularData",
        "click a.hide":"hideTabularData",
        "click button.close_dialog":"closeModal",
        "click button.save":"downloadVisualization"
    },

    setup:function () {
        this.model = this.options.model;
        this.type = this.options.chartOptions.type;
        this.title = t("visualization.title", {name:this.options.chartOptions.name});

        this.chartData = new chorus.views.ResultsConsole({shuttle:false});

        var func = 'make' + _.capitalize(this.type) + 'Task';
        this.task = this.model[func](this.options.chartOptions);
        this.task.set({filters: this.options.filters && this.options.filters.whereClause()});
        this.task.bind("saved", this.onExecutionComplete, this);
        this.task.save();
    },

    postRender:function () {
        this.$('.chart_icon.' + this.type).addClass("selected");
    },

    onExecutionComplete:function () {
        this.drawChart();
        this.chartData.trigger('file:executionCompleted', this.task);

    },

    drawChart:function () {
        this.chart = new chorus.views.visualizations[_.capitalize(this.type)]({model:this.task});
        this.subviews[".chart_area"] = "chart";
        this.render();
    },

    createDownloadForm:function () {
        var serializer = new XMLSerializer;
        var svg = this.$(".chart_area.visualization svg")[0];

        if (BrowserDetect.browser != "Explorer") {
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        }

        var form = $("<form action='/downloadChart.jsp' method='post'></form>");
        form.append($("<input name='svg' type='hidden'/>").val(serializer.serializeToString(svg)));
        form.append($("<input name='chart-name' type='hidden'/>").val(this.options.chartOptions.name));
        form.append($("<input name='chart-type' type='hidden'>/").val(this.options.chartOptions.type));
        return form;
    },

    additionalContext:function () {
        return {
            filterCount:2,
            chartType:t("dataset.visualization.names." + this.type),
            hasChart: !!this.chart
        }
    },

    showTabularData:function (e) {
        e && e.preventDefault();
        this.$('.results_console').removeClass("hidden");
        this.$(".dialog_controls a.hide").removeClass("hidden");
        this.$(".dialog_controls a.show").addClass("hidden");
        this.recalculateScrolling();
    },

    hideTabularData:function (e) {
        e && e.preventDefault();
        this.$('.results_console').addClass("hidden")
        this.$(".dialog_controls a.show").removeClass("hidden");
        this.$(".dialog_controls a.hide").addClass("hidden");
    },

    downloadVisualization:function (event) {
        event.preventDefault();
        var form = this.createDownloadForm()
        form.hide();
        $("body").append(form)
        form.submit();
    }
});