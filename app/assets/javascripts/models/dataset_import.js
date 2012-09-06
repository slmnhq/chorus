chorus.models.DatasetImport = chorus.models.Base.extend({
    constructorName: "DatasetImport",
    urlTemplate: "workspaces/{{workspaceId}}/datasets/{{datasetId}}/import",

    declareValidations: function(newAttrs) {
        if (newAttrs.newTable == "true") {
            this.requirePattern("toTable", chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, 'import.validation.toTable.required');
        }

        this.requirePattern("truncate", chorus.ValidationRegexes.Boolean(), newAttrs);
        this.requirePattern("newTable", chorus.ValidationRegexes.Boolean(), newAttrs);

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
            return Date.parseFromApi(this.get("scheduleInfo").startDatetime);
        } else if (this.get("scheduleStartTime")) {
            return Date.parse(this.get("scheduleStartTime").split(".")[0]);
        } else {
            return Date.today().set({hour: 23});
        }
    },

    frequency: function() {
        if (this.get("scheduleInfo")) {
            return this.get("scheduleInfo").frequency.toUpperCase();
        } else if (this.get("scheduleFrequency")) {
            return this.get("scheduleFrequency");
        }
    },

    endTime: function() {
        if (this.get("scheduleInfo")) {
            return Date.parse(this.get("scheduleInfo").endDate);
        } else if (this.get("scheduleEndTime")) {
            return Date.parse(this.get("scheduleEndTime"));
        }
    },

    lastExecutionAt: function() {
        return this.get("executionInfo").completedStamp
    },

    hasLastImport: function() {
        return this.has("executionInfo") && this.get("executionInfo").startedStamp;
    },

    nextExecutionAt: function() {
        return this.get("scheduleInfo").nextImportAt
    },

    hasNextImport: function() {
        return !!this.get("scheduleInfo").nextImportAt
    },

    thisDatasetIsSource: function() {
        return this.get("datasetId") === this.get("sourceId") || !this.get("sourceId");
    },

    thisDatasetIsDestination: function() {
        return !this.thisDatasetIsSource() && this.has("sourceId")
    },

    nextDestination: function() {
        return new chorus.models.WorkspaceDataset({
            id: this.get("scheduleInfo").id, // TODO: need table ID
            objectName: this.get("scheduleInfo").toTable,
            workspaceId: this.get("workspaceId")
        });
    },

    lastDestination: function() {
        return new chorus.models.WorkspaceDataset({
            id: this.get("executionInfo").toTableId,
            objectName: this.get("executionInfo").toTable,
            workspaceId: this.get("workspaceId")
        });
    },

    importSource: function() {
        return new chorus.models.WorkspaceDataset({
            id: this.get("sourceId"),
            objectName: this.get("sourceTable"),
            workspaceId: this.get("workspaceId")
        });
    },

    wasSuccessfullyExecuted: function() {
        return this.get("executionInfo") && this.get("executionInfo").state == "success";
    },

    isInProgress: function() {
        var executionInfo = this.get("executionInfo");
        return executionInfo && executionInfo.startedStamp && !executionInfo.completedStamp;
    },

    hasActiveSchedule: function() {
        return this.has('scheduleInfo') && this.get('scheduleInfo').id
    }
});
