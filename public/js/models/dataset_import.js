chorus.models.DatasetImport = chorus.models.Base.extend({
    constructorName: "DatasetImport",
    urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}/import",

    declareValidations: function(newAttrs) {
        if (newAttrs.isNewTable == "true") {
            this.requirePattern("toTable", chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, 'import.validation.toTable.required');
        }

        this.requirePattern("truncate", chorus.ValidationRegexes.Boolean(), newAttrs);
        this.requirePattern("isNewTable", chorus.ValidationRegexes.Boolean(), newAttrs);

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
