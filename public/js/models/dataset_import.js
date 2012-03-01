chorus.models.DatasetImport = chorus.models.Base.extend({
    urlTemplate: "workspace/{{workspaceId}}/dataset/{{datasetId}}/import",

    declareValidations: function(newAttrs) {
        if (newAttrs.isNewTable == "true") {
            this.requirePattern("toTable", /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, newAttrs);
        }

        this.requirePattern("truncate", /^(true|false)$/, newAttrs);
        this.requirePattern("isNewTable", /^(true|false)$/, newAttrs);

        if (newAttrs.useLimitRows) {
            this.requirePositiveInteger("sampleCount", newAttrs);
        }
    },

    beforeSave: function(attrs) {
        if (attrs.sampleCount || this.has("sampleCount")) {
            attrs.sampleMethod = "RANDOM_COUNT";
        }
    },

    startTime: function() {
        if (this.get("scheduleInfo")) {
            return this.get("scheduleInfo").startTime.split(".")[0];
        } else if (this.get("scheduleStartTime")) {
            return this.get("scheduleStartTime").split(".")[0];
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
            return this.get("scheduleInfo").endTime;
        } else if (this.get("scheduleEndTime")) {
            return this.get("scheduleEndTime");
        }
    },

    wasSuccessfullyExecuted: function() {
        return this.get("executionInfo") && this.get("executionInfo").state == "success";
    }
});
