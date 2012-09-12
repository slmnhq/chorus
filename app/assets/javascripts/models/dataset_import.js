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

        if (newAttrs.isActive) {
            if (newAttrs.scheduleStartTime > newAttrs.scheduleEndTime) {
                this.setValidationError("year", "import.schedule.error.start_date_must_precede_end_date", null, newAttrs);
            }
        }
    },

    startTime:function () {
        if (this.get("startDatetime")) {
            return Date.parseFromApi(this.get("startDatetime").split(".")[0]);
        } else {
            return Date.today().set({hour:23});
        }
    },

    frequency:function () {
        return this.get("frequency") && this.get("frequency").toUpperCase();
    },

    endTime:function () {
        return  this.get("endDate") && Date.parse(this.get("endDate"));
    },

    lastExecutionAt:function () {
        return this.get("executionInfo").completedStamp
    },

    hasLastImport: function() {
        return this.has("executionInfo") && this.get("executionInfo").startedStamp;
    },

    nextExecutionAt: function() {
        return this.get("nextImportAt")
    },

    hasNextImport: function() {
        return !!this.get("nextImportAt")
    },

    thisDatasetIsSource: function() {
        return this.get("datasetId") === this.get("sourceId") || !this.get("sourceId");
    },

    thisDatasetIsDestination: function() {
        return !this.thisDatasetIsSource() && this.has("sourceId")
    },

    nextDestination: function() {
        return new chorus.models.WorkspaceDataset({
            id: this.get("destinationDatasetId"),
            objectName: this.get("toTable"),
            workspace: {id: this.get("workspaceId")}
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
        return this.has("id") ;
    }
});
