chorus.views.ResultsConsole = chorus.views.Base.extend({
    className: "results_console",
    events: {
        "click .cancel": "cancelExecution",
        "click a.maximize": "maximizeTable",
        "click a.minimize": "minimizeTable",
        "click .expander_button": "toggleExpand",
        "click .close_errors": "closeError",
        "click .view_details": "viewDetails",
        "click a.close": "clickClose"
    },

    setup: function() {
        this.bind("file:executionStarted", this.executionStarted, this)
        this.bind("file:executionCompleted", this.executionCompleted, this)
    },

    execute: function(model) {
        this.model = model;
        model.fetchIfNotLoaded();
        this.executionStarted();
        model.onLoaded(_.bind(this.executionCompleted, this, model));
    },

    executionStarted: function() {
        this.elapsedTime = 0
        this.$(".right").addClass("executing")
        this.spinnerTimer = _.delay(_.bind(this.startSpinner, this), 250)
        this.elapsedTimer = _.delay(_.bind(this.incrementElapsedTime, this), 1000)
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

    executionCompleted: function(task) {
        this.cancelTimers()
        this.$(".right").removeClass("executing")
        this.$(".spinner").stopLoading()

        if (task.errorMessage()) {
            this.$(".errors").removeClass("hidden");
            this.$(".result_content").addClass("hidden");
            this.$(".message").empty();
        } else {
            this.dataTable = new chorus.views.TaskDataTable({shuttle: this.options.shuttle, model: task});
            this.dataTable.render();
            this.$(".result_content").removeClass("hidden");
            this.$(".result_table").html(this.dataTable.el);
        }

        this.$(".controls").removeClass("hidden");

        this.minimizeTable();
    },

    cancelExecution: function(event) {
        this.cancelTimers()
        event.preventDefault();
        this.model.save({ action: "cancel" });
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
        if(this.options.footerSize) {
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
        e.preventDefault();
        this.$(".result_content").removeClass("hidden");
    },

    viewDetails: function(e) {
        e.preventDefault();

        var alert = new chorus.alerts.ExecutionError({model: this.model});
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
        this.trigger("action:close");
    },

    additionalContext: function() {
        return {
            titleKey: this.options.titleKey || "results_console_view.title",
            enableClose: this.options.enableClose
        }
    }
});

