chorus.models.DatasetImport = chorus.models.Base.extend({
    constructorName: "DatasetImport",
    urlTemplate: "workspace/{{workspaceId}}/dataset/{{encode datasetId}}/import",

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

    lastExecutionAt: function() {
        return this.get("executionInfo").completedStamp
    },

    hasLastImport: function() {
        return this.has("executionInfo")
    },

    nextExecutionAt: function() {
        return this.get("nextImportTime")
    },

    hasNextImport: function() {
        return this.has("nextImportTime")
    },

    nextDestination: function() {
        return new chorus.models.Dataset({
            id: this.get("destinationTable"),
            workspaceId: this.get("workspaceId"),
            objectName: this.get("toTable")
        });
    },

    lastDestination: function() {
        // TODO: This is a bug, because the id points to the *next* destination
        // table, but the API doesn't give us the *last* destination table's ID.
        // Waiting on https://www.pivotaltracker.com/story/show/27131461 for good data.
        // The correct value will probably look like this.get("executionInfo").destinationTable
        return new chorus.models.Dataset({
            id: this.get("destinationTable"),
            objectName: this.get("executionInfo").toTable,
            workspaceId: this.get("workspaceId")
        });
    },

    importSource: function() {
        return new chorus.models.Dataset({
            id: this.get("sourceId"),
            workspaceId: this.get("workspaceId"),
            objectName: this.get("sourceTable")
        });
    },

    wasSuccessfullyExecuted: function() {
        return this.get("executionInfo") && this.get("executionInfo").state == "success";
    },

    isInProgress: function() {
        return this.get("executionInfo") && !(this.get("executionInfo").completedStamp);
    },

    hasActiveSchedule: function() {
        return this.has('scheduleInfo') && this.get('scheduleInfo').jobName
    }
});
