chorus.views.DatasetContentDetails = chorus.views.Base.extend({
    className:"dataset_content_details",

    postRender:function () {
        var self = this;
        chorus.menu(this.$('.transform'), {
            content:this.$(".transform_options").html(),
            orientation:"left",
            contentEvents:{
                '.visualize':_.bind(this.startVisualizationWizard, this)
            }
        });
    },

    startVisualizationWizard : function() {
        this.trigger("transform:visualize")
    }

});