chorus.views.DatabaseFunctionSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseFunctionSidebarListView",
    templateName:"database_function_sidebar_list",
    useLoadingSection:true,

    postRender: function() {
        this._super("postRender", arguments);

        chorus.search({
            list: this.$('ul'),
            input: this.$('input.search')
        });

        this.$("li .name").qtip({
            events: {
                render: _.bind(function(e, api) {
                    e.preventDefault();
                    e.stopPropagation();
                    var cid = $(api.elements.target).parent().data('cid');
                    var model = this.collection.getByCid(cid);
                    var content = this.tooltipContent(model);
                    $(api.elements.content).html(content)
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
                effect: false
            },
            hide: {
                delay: 250,
                fixed: true,
                effect: false
            },
            position: {
                viewport: $(window),
                my: "top center",
                at: "bottom left"
            },
            style: {
                classes: "tooltip-function",
                tip: {
                    def: false,
                    height: 5,
                    classes: 'hidden'
                }
            }
        });

    },

    tooltipContent: function(model) {
        var arguments = model.getFunctionArguments();
        var html = chorus.helpers.renderTemplate("database_function_sidebar_tooltip", {
            description:_.prune(model.get("description") || '', 100),
            returnType: model.get("returnType"),
            name: model.get("functionName"),
            argumentsString: model.formattedArgumentList()
        }).toString();
        var content = $("<div/>").html(html);
        content.find("a.more").data("model", model);
        return content;
    },

    collectionModelContext: function(model) {
        return {
            hintText: model.toHintText(),
            cid: model.cid,
            name: model.get("functionName"),
            fullName: model.toText()
        }
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.functions();
        this.bindings.add(this.resource, "change reset add remove", this.render);
        this.collection.fetchIfNotLoaded();
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});
