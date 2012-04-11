chorus.views.DatabaseSidebarList = chorus.views.Base.extend({
    constructorName: "DatabaseSidebarListView",
    events: {
        "click .context a": "contextClicked",
        "click .no_credentials .add_credentials": "launchAddCredentialsDialog"
    },

    collectionModelContext: function(model) {
        return {
            cid: model.cid
        }
    },

    setup: function() {
        this.setSchema(this.options.schema);
        chorus.PageEvents.subscribe("workfile:executed", this.workfileExecuted, this);
    },

    additionalContext: function() {
        if (!this.schema) {
            return {
                schemaAssociated: false
            }
        } else {
            var errorMessage = this.collection && this.collection.serverErrors && this.collection.serverErrors[0] && this.collection.serverErrors[0].message
            return {
                schemaAssociated: true,
                schemaName: this.schema && this.schema.get("name"),
                schemaLink: chorus.helpers.linkTo("#", this.schema.get('name')),
                schemas: this.schemas.map(function(schema) {
                    return {
                        id: schema.get("id"),
                        name: schema.get("name"),
                        isCurrent: this.schema.get('id') === schema.get('id')
                    };
                }, this),
                noCredentials: errorMessage && errorMessage.match(/Account.*map.*needed/),
                noCredentialsWarning: chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
            };
        }
    },

    setSchemaToCurrentWorkspace: $.noop,
    fetchResourceAfterSchemaSelected: $.noop,

    postRender: function() {
        chorus.menu(this.$(".context a"), {
            content: this.$(".schema_menu_container").html(),
            container: $('#sidebar_wrapper'),
            contentEvents: {
                'a.schema': _.bind(this.schemaSelected, this)
            }
        });

        this.$("ul").on("click.database_sidebar_list", "li a", null, this.closeQtip);
        this.$("li").qtip({
            content: "<a>" + t('database.sidebar.insert') + "</a>",
            events: {
                render: _.bind(function(e, api) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(api.elements.content).find('a').click(_.bind(this.insertText, this, $(api.elements.target).data('cid')));
                }, this),
                show: function(e, api) {
                    $(api.elements.target).addClass('hover');
                },
                hide: function(e, api) {
                    $(api.elements.target).removeClass('hover');
                }
            },
            show: {
                delay: 0,
                solo: true,
                effect: false
            },
            hide: {
                delay: 0,
                fixed: true,
                effect: false
            },
            position: {
                my: "right center",
                at: "left center",
                adjust: {
                    x: -16
                }
            },
            style: {
                classes: "tooltip-insert",
                tip: {
                    corner: "left center",
                    width: 16,
                    height: 29
                }
            }
        });

        chorus.page && chorus.page.sidebar && chorus.page.sidebar.bind("scroll", _.bind(function() {
            $(".hover").removeClass("hover");
            this.closeQtip();
        }, this));

        this.$("ul.list li").draggable({
            cursor: "move",
            containment: "window",
            appendTo: "body",
            helper: this.dragHelper
        });
    },

    dragHelper : function(e) {
        return $(e.currentTarget).clone().addClass("drag_helper");
    },

    schemaSelected: function(e) {
        var schemaId = $(e.target).data("id")
        if (schemaId === "workspaceSchema") {
            this.setSchemaToCurrentWorkspace();
            this.fetchResourceAfterSchemaSelected();

        } else {
            this.schema = this.schemas.get(schemaId)
            this.fetchResourceAfterSchemaSelected();
        }

        this.render();
    },

    insertText: function(cid, e) {
        e && e.preventDefault();
        var model = this.collection.getByCid(cid)
        chorus.PageEvents.broadcast("file:insertText", model.toText());
    },

    closeQtip: function() {
        $("li:hover a").trigger("mouseleave");
    },

    contextClicked: function(e) {
        e.preventDefault();
    },

    workfileExecuted: function(workfile, executionSchema) {
        if (!this.schema ||
            (executionSchema.instanceId != this.schema.get("instanceId")) ||
            (executionSchema.databaseName != this.schema.get("databaseName")) ||
            (executionSchema.schemaName != this.schema.get("name")))
        {
            this.setSchema(new chorus.models.Schema(_.extend(executionSchema, { name: executionSchema.schemaName })))
        }
    },

    setSchema: function(schema) {
        this.schema = schema;
        if (this.schema) {
            this.schemas = this.schema.database().schemas();
            this.schemas.fetch();
            this.fetchResourceAfterSchemaSelected();
        }
    },

    launchAddCredentialsDialog: function(e) {
        e && e.preventDefault();
        var instance = new chorus.models.Instance({id: this.schema.get("instanceId")});
        new chorus.dialogs.InstanceAccount({ instance: instance, title: t("instances.sidebar.add_credentials"), reload: true }).launchModal();
    }
});
