chorus.models.DatasetImport = chorus.models.Base.extend({
    urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}/import",

    declareValidations: function(newAttrs) {
        if (newAttrs.isNewTable == "true") {
            this.requirePattern("toTable", /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, newAttrs, 'import.validation.toTable.required');
        }

        this.requirePattern("truncate", /^(true|false)$/, newAttrs);
        this.requirePattern("isNewTable", /^(true|false)$/, newAttrs);

        if (newAttrs.useLimitRows) {
            this.requirePositiveInteger("sampleCount", newAttrs, 'import.validation.sampleCount.positive');
        }

        if (newAttrs.activateSchedule) {
            if (newAttrs.scheduleStartTime > newAttrs.scheduleEndTime) {
                this.setValidationError("year", "import.schedule.error.start_date_must_precede_end_date", null, newAttrs);
            }
        }
    },

    beforeSave: function(attrs) {
        if (attrs.sampleCount || this.has("sampleCount")) {
            attrs.sampleMethod = "RANDOM_COUNT";
        }
    },

    startTime: function() {
        if (this.get("scheduleInfo")) {
            return Date.parse(this.get("scheduleInfo").startTime.split(".")[0]);
        } else if (this.get("scheduleStartTime")) {
            return Date.parse(this.get("scheduleStartTime").split(".")[0]);
        } else {
            return Date.today().set({hour: 23});
        }
    },

    frequency: function() {
        if (this.get("scheduleInfo")) {
            return this.get("scheduleInfo").frequency;
        } else if (this.get("scheduleFrequency")) {
            return this.get("scheduleFrequency");
        }
    },

    endTime: function() {
        if (this.get("scheduleInfo")) {
            return Date.parse(this.get("scheduleInfo").endTime);
        } else if (this.get("scheduleEndTime")) {
            return Date.parse(this.get("scheduleEndTime"));
        }
    },

    wasSuccessfullyExecuted: function() {
        return this.get("executionInfo") && this.get("executionInfo").state == "success";
    },

    hasActiveSchedule: function() {
        return this.has('scheduleInfo') && this.get('scheduleInfo').jobName
    }
});
