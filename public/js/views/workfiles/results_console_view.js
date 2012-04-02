chorus.views.ResultsConsole = chorus.views.Base.extend({
    className: "results_console",
    events: {
        "click .cancel": "cancelExecution",
        "click a.maximize": "maximizeTable",
        "click a.minimize": "minimizeTable",
        "click .expander_button": "toggleExpand",
        "click .close_errors": "closeError",
        "click .sql_errors .view_details": "viewErrorDetails",
        "click .execution .view_details": "viewExecutionDetails",
        "click a.close": "clickClose"
    },

    setup: function() {
        chorus.PageEvents.subscribe("file:executionStarted", this.executionStarted, this);
        chorus.PageEvents.subscribe("file:executionSucceeded", this.executionSucceeded, this);
        chorus.PageEvents.subscribe("file:executionFailed", this.executionFailed, this);
    },

    execute: function(task, isPostRequest) {
        this.resource = this.model = task;
        if(isPostRequest) {
            task.save();
        } else {
            task.fetchIfNotLoaded();
        }
        this.executionStarted();
        this.bindings.add(task, "loaded", _.bind(this.executionSucceeded, this, task));
        this.bindings.add(task, "saved", _.bind(this.executionSucceeded, this, task));
        this.bindings.add(task, "fetchFailed", _.bind(this.executionFailed, this, task));
        this.bindings.add(task, "saveFailed", _.bind(this.executionFailed, this, task));
    },

    executionStarted: function() {
        this.elapsedTime = 0
        this.$(".right").addClass("executing")
        this.spinnerTimer = _.delay(_.bind(this.startSpinner, this), 250)
        this.elapsedTimer = _.delay(_.bind(this.incrementElapsedTime, this), 1000)
        this.$(".execution").removeClass("hidden");
        this.$(".bottom_gutter").addClass("hidden");
        this.$(".result_table").html("");
        this.closeError();
    },

    startSpinner: function() {
        delete this.spinnerTimer;
        this.$(".spinner").startLoading()
    },

    incrementElapsedTime: function() {
        this.elapsedTime++
        this.$(".elapsed_time").text(t("results_console_view.elapsed", { sec: this.elapsedTime }))
        this.elapsedTimer = _.delay(_.bind(this.incrementElapsedTime, this), 1000)
    },

    hideSpinner: function() {
        this.cancelTimers()
        this.$(".right").removeClass("executing")
        this.$(".spinner").stopLoading()
    },

    executionSucceeded: function(task) {
        this.showResultTable(task)
        this.hideSpinner();

        if (task.get("result") && task.get("result").hasResult == "false") {
            this.collapseTable();
        }
    },

    showResultTable: function(task) {
        this.dataTable = new chorus.views.TaskDataTable({shuttle: this.options.shuttle, hideExpander: this.options.hideExpander, model: task});
        this.dataTable.render();
        this.$(".result_table").removeClass("hidden");
        this.$(".result_table").html(this.dataTable.el);
        this.$(".controls").removeClass("hidden");
        this.minimizeTable();
    },

    executionFailed: function(task) {
        this.showErrors()
        this.hideSpinner()
    },

    showErrors: function() {
        this.$(".sql_errors").removeClass("hidden");
        this.$(".result_table").addClass("hidden");
        this.$(".bottom_gutter").addClass("hidden");
        this.$(".execution").addClass("hidden");
        this.$(".message").empty();
    },

    cancelExecution: function(event) {
        this.cancelTimers()
        event.preventDefault();
        this.model.cancel();
        this.clickClose();
    },

    cancelTimers: function() {
        if (this.spinnerTimer) {
            clearTimeout(this.spinnerTimer);
            delete this.spinnerTimer
        }

        if (this.elapsedTimer) {
            clearTimeout(this.elapsedTimer);
            delete this.elapsedTimer
        }
    },

    minimizeTable: function(e) {
        e && e.preventDefault()
        this.$('.data_table').css("height", "");
        this.$("a.minimize").addClass("hidden");
        this.$("a.maximize").removeClass("hidden");
        this.$(".controls").removeClass("collapsed");

        this.$(".result_table").removeClass("collapsed");
        this.$(".result_table").removeClass("maximized");
        this.$(".result_table").addClass("minimized");

        this.$(".bottom_gutter").removeClass("hidden")
        this.$(".arrow").removeClass("down")
        this.$(".arrow").addClass("up")
        this.recalculateScrolling();
    },

    maximizeTable: function(e) {
        e && e.preventDefault()
        this.$("a.maximize").addClass("hidden");
        this.$("a.minimize").removeClass("hidden");
        this.$(".controls").removeClass("collapsed");

        this.$(".result_table").removeClass("collapsed");
        this.$(".result_table").removeClass("minimized");
        this.$(".result_table").addClass("maximized");
        this.$(".data_table").css("height", this.getDesiredDataTableHeight());
        this.recalculateScrolling();
    },

    getDesiredDataTableHeight: function() {
        return $(window).height() - this.$(".data_table").offset().top - this.$(".bottom_gutter").height() - this.footerSize();
    },

    footerSize: function() {
        if (this.options.footerSize) {
            return this.options.footerSize();
        }
        return 0;
    },

    collapseTable: function() {
        this.$("a.maximize").addClass("hidden");
        this.$("a.minimize").addClass("hidden");
        this.$(".controls").addClass("collapsed");

        this.$(".result_table").addClass("collapsed");
        this.$(".result_table").removeClass("minimized");
        this.$(".result_table").removeClass("maximized");
        this.$(".data_table").css("height", "");
    },

    closeError: function(e) {
        e && e.preventDefault();
        this.$(".sql_errors").addClass("hidden");
    },

    viewErrorDetails: function(e) {
        e.preventDefault();
        var alert = new chorus.alerts.ExecutionError({ model: this.model });
        alert.launchModal();
    },

    viewExecutionDetails: function(e) {
        e.preventDefault();
        var alert = new chorus.alerts.ExecutionMessage({ model: this.model });
        alert.launchModal();
    },

    toggleExpand: function() {
        var $arrow = this.$(".arrow");
        if ($arrow.is(".up")) {
            $arrow.removeClass("up").addClass("down");
            this._shouldMinimize = this.$('.result_table').is(".minimized");
            this.collapseTable();
        } else {
            $arrow.removeClass("down").addClass("up");
            if (this._shouldMinimize) {
                this.minimizeTable();
            } else {
                this.maximizeTable();
            }
        }
    },

    clickClose: function(e) {
        e && e.preventDefault();
        chorus.PageEvents.broadcast("action:closePreview");
    },

    additionalContext: function(ctx) {
        return {
            titleKey: this.options.titleKey || "results_console_view.title",
            enableClose: this.options.enableClose,
            expander: !(this.options.hideExpander)
        }
    }
});

