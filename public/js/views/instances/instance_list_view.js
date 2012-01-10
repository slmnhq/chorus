;
(function(ns) {
    ns.views.InstanceList = chorus.views.Base.extend({
        className : "instance_list",

        events : {
            "click li" : "selectItem"
        },

        setup : function() {
            this.bind("instance:added", function(id) {
                this.collection.fetchAll();
                this.selectedInstanceId = id;
            }, this);
            this.collection.bind("remove", function() { this.$('.instance_provider li:first').click(); }, this);
        },

        postRender : function() {
            var otherEl = this.$(".other_instance ul");
            var elMap = {
                "Greenplum Database" : this.$(".greenplum_instance ul"),
                "Hadoop" : this.$(".hadoop_instance ul")
            };
            var models = _.clone(this.collection.models);
            models.sort(function(a, b) {
                return naturalSort(a.get("name").toLowerCase(), b.get("name").toLowerCase());
            });
            _.each(models, function(model) {
                var view = new ns.views.Instance({model: model});
                view.render();
                var li = $("<li />").append(view.el);
                li.data('model', model);
                li.attr("data-instance-id", model.get("id"));
                var ul = elMap[model.get("instanceProvider")] || otherEl;
                ul.append(li);
                ul.next(".no_instances").detach();
                view.delegateEvents();
            });

            if (this.selectedInstanceId) {
                this.$('.instance_provider li[data-instance-id= ' + this.selectedInstanceId + ']').click();
            } else {
                this.$('.instance_provider li:first').click();
            }
        },

        selectItem : function(e) {
            var target = $(e.currentTarget);
            if (target.hasClass("selected")) {
                return;
            }

            this.$("li").removeClass("selected");
            target.addClass("selected");
            var instance = target.data('model');
            this.selectedInstanceId = instance.get("id");
            this.trigger("instance:selected", instance);
        }
    });
})(chorus);