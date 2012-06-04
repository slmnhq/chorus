chorus.dialogs.InstancesNew = chorus.dialogs.Base.extend({
    constructorName: "InstancesNew",
    templateName:"instance_new",
    title:t("instances.new_dialog.title"),
    persistent:true,

    events:{
        "change input[type='radio']":"showFieldset",
        "click button.submit": "createInstance",
        "click a.close_errors": "clearServerErrors"
    },

    setup:function () {
        this.aurora = chorus.models.Instance.aurora();
        this.bindings.add(this.aurora, "loaded", this.fetchTemplates, this);
        this.aurora.fetch();

        this.requiredResources.add(chorus.models.Config.instance());
        this.requiredResources.add(this.aurora);
    },

    fetchTemplates: function() {
        if (this.aurora.isInstalled()) {
            this.templates = chorus.models.Instance.auroraTemplates();
            this.bindings.add(this.templates, "loaded", this.templatesLoaded, this);
            this.templates.fetch();
        }
    },

    templatesLoaded: function() {
        var $select = $("<select name='template' class='instance_size'></select>");
        _.each(this.templates.models, function(template) {
            var $option = $("<option></option>").val(template.name()).text(template.toText());
            $select.append($option);
        });

        this.$(".instance_size_container").append($select);
        chorus.styleSelect(this.$("select.instance_size"));
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.Instance();
    },

    additionalContext: function() {
        return {
            auroraInstalled: chorus.models.Instance.aurora().isInstalled(),
            provisionMaxSizeInGB: chorus.models.Config.instance().get("provisionMaxSizeInGB")
        }
    },

    showFieldset:function (e) {
        this.$("fieldset").addClass("collapsed");
        $(e.currentTarget).closest("fieldset").removeClass("collapsed");
        this.clearErrors();
        this.$("button.submit").prop("disabled", false)
    },

    createInstance:function (e) {
        e && e.preventDefault();

        this.resource = this.model = new (this.instanceClass());
        this.bindings.add(this.model, "saved", this.saveSuccess);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);

        this.$("button.submit").startLoading("instances.new_dialog.saving");
        var values = this.fieldValues();
        this.model.save(values);
    },

    instanceClass: function() {
        var instanceType = this.$("input[name=instance_type]").filter(":checked").attr("id");
        if (instanceType === "register_existing_hadoop") {
            return chorus.models.HadoopInstance;
        } else {
            return chorus.models.Instance;
        }
    },

    fieldValues: function() {
        var updates = {};
        var inputSource = this.$("input[name=instance_type]:checked").closest("fieldset");
        _.each(inputSource.find("input[type=text], input[type=hidden], input[type=password], textarea, select"), function (i) {
            var input = $(i);
            updates[input.attr("name")] = input.val().trim();
        });

        updates.shared = inputSource.find("input[name=shared]").prop("checked") ? "true" : "false";
        return updates;
    },

    clearServerErrors : function() {
        this.model.serverErrors = {};
    },

    saveSuccess:function () {
        chorus.PageEvents.broadcast("instance:added", this.model);

        if (this.model.get("provision_type") == "create") {
            this.provisioning = true;
            chorus.toast("instances.new_dialog.provisioning");
            chorus.router.navigate("/instances", { selectId: this.model.get("id") });

        }

        this.closeModal();
    },

    saveFailed:function () {
        this.$("button.submit").stopLoading();
        this.showErrors();
    }
});

