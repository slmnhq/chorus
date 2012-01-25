(function(ns) {
    ns.views.DatabaseList = ns.views.Base.extend({

        collectionModelContext : function(model) {
            return {
                cid: model.cid
            }
        },

        postRender: function() {
            chorus.search({
                input: this.$('input.search'),
                list: this.$('ul')
            });
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
                    solo : true,
                    effect:false
                },
                hide: {
                    delay: 0,
                    fixed: true,
                    effect:false
                },
                position : {
                    my: "right center",
                    at: "left center",
                    adjust : {
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
        },

        insertText: function(cid, e) {
            e && e.preventDefault();
            var model = this.collection.getByCid(cid)
            this.trigger("file:insertText", model.toString())
        }
    });
})(chorus);
