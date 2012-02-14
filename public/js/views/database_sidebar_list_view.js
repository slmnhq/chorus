chorus.views.DatabaseSidebarList = chorus.views.Base.extend({
    events:{
        "click .context a":"contextClicked"
    },

    collectionModelContext:function (model) {
        return {
            cid:model.cid
        }
    },

    setup:function () {
        this.sandbox = this.options.sandbox;
        if (this.sandbox) {
            this.schemas = this.sandbox.database().schemas();
            this.schema = this.sandbox.schema();
            this.schemas.fetch();
            this.fetchResourceAfterSchemaSelected(this.schema);
        }
    },

    additionalContext:function () {
        if (!this.sandbox) {
            return {}
        } else {
            return {
                schemaName:this.schema.get("name"),
                schemaLink:chorus.helpers.linkTo("#", this.schema.get('name')),
                schemas:this.schemas.map(function (schema) {
                    return {
                        id:schema.get("id"),
                        name:schema.get("name"),
                        isCurrent:this.schema.get('id') === schema.get('id')
                    };
                }, this)
            };
        }
    },

    fetchResourceAfterSchemaSelected:$.noop,

    postRender:function () {
        chorus.search({
            input:this.$('input.search'),
            list:this.$('ul')
        });

        chorus.menu(this.$(".context a"), {
            content:this.$(".schema_menu_container").html(),
            container:$('#sidebar_wrapper'),
            contentEvents:{
                'a.schema':_.bind(this.schemaSelected, this)
            }
        });

        this.$("li a").click(this.closeQtip);
        this.$("li").qtip({
            content:"<a>" + t('database.sidebar.insert') + "</a>",
            events:{
                render:_.bind(function (e, api) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(api.elements.content).find('a').click(_.bind(this.insertText, this, $(api.elements.target).data('cid')));
                }, this),
                show:function (e, api) {
                    $(api.elements.target).addClass('hover');
                },
                hide:function (e, api) {
                    $(api.elements.target).removeClass('hover');
                }
            },
            show:{
                delay:0,
                solo:true,
                effect:false
            },
            hide:{
                delay:0,
                fixed:true,
                effect:false
            },
            position:{
                my:"right center",
                at:"left center",
                adjust:{
                    x:-16
                }
            },
            style:{
                classes:"tooltip-insert",
                tip:{
                    corner:"left center",
                    width:16,
                    height:29
                }
            }
        });

        chorus.page && chorus.page.sidebar.bind("scroll", _.bind(function() {
            $(".hover").removeClass("hover");
            this.closeQtip();
        }, this));
    },

    schemaSelected:function (e) {
        var schemaId = $(e.target).data("id")
        this.schema = this.schemas.get(schemaId)
        this.fetchResourceAfterSchemaSelected(this.schema);
        this.render();
    },

    insertText:function (cid, e) {
        e && e.preventDefault();
        var model = this.collection.getByCid(cid)
        chorus.PageEvents.broadcast("file:insertText", model.toText())
    },

    closeQtip:function () {
        $("li:hover a").trigger("mouseleave");
    },

    contextClicked:function (e) {
        e.preventDefault();
    }
});
