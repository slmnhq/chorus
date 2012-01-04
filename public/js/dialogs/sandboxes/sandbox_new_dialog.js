;
(function(ns) {
    ns.dialogs.SandboxNew = ns.dialogs.Base.extend({
        className : "sandbox_new",

        events : {
            "change .instance select" : "instanceSelected",
            "change .database select" : "databaseSelected",
            "change .schema select" : "schemaSelected"
        },

        setup: function() {
            this.instances = new ns.models.InstanceSet();
            this.instances.bind("reset", this.updateInstances, this);
            this.instances.fetchAll();
        },

        updateInstances: function() {
            this.$(".instance .loading").hide();
            var select = this.$(".instance select");
            select.append($("<option/>").text(t("sandbox.select_instance")));
            this.instances.each(function(instance) {
                select.append(
                    $("<option/>", {value : instance.get("id")}).text(instance.get("name"))
                );
            });

            select.show().chosen();
        },

        instanceSelected : function() {
            var selectedInstance = this.instances.get(this.$('.instance select option:selected').val());
            this.databases = selectedInstance.databases();
            this.databases.bind("reset", this.updateDatabases, this);
            this.databases.fetch();
        },

        updateDatabases : function() {
            this.$(".database .loading").hide();
            var select = this.$(".database select");
            select.append($("<option/>").text(t("sandbox.select_database")));
            this.databases.each(function(database) {
                select.append(
                    $("<option/>", {value : database.get("id")}).text(database.get("name"))
                );
            });

            select.show().chosen();
        },

        databaseSelected : function() {
            var selectedDatabase = this.databases.get(this.$('.database select option:selected').val());
            this.schemas = selectedDatabase.schemas();
            this.schemas.bind("reset", this.updateSchemas, this);
            this.schemas.fetch();
        },

        updateSchemas : function() {
            this.$(".schema .loading").hide();
            var select = this.$(".schema select");
            select.append($("<option/>").text(t("sandbox.select_schema")));
            this.schemas.each(function(schema) {
                select.append(
                    $("<option/>", {value : schema.get("id")}).text(schema.get("name"))
                );
            });

            select.show().chosen();
        },

        schemaSelected: function() {
            this.$('button.submit').prop('disabled', false);
        }
    });
})(chorus);
