(function($, ns) {
    ns.WorkfileContentDetails = ns.Base.extend({
            className : "workfile_content_details",

            setup : function() {
                this.bind("autosaved", this.updateAutosaveText);
            },

            updateAutosaveText: function(args) {
                var text = args ?  args : "workfile.content_details.auto_save";

                var time = this.formatTime(new Date());
                this.$("span.auto_save").removeClass("hidden");
                this.$("span.auto_save").text(t(text, {time: time}))
            },

            postRender: function() {
                var self = this;
                this.$(".save_as").qtip({
                    content: this.$(".save_options").html(),
                    show: 'click',
                    hide: 'unfocus',
                    style: {
                        width: 160,
                        color: "black",
                        'font-size': 13,
                        tip: {
                            corner: 'bottomMiddle',
                            size: {
                                x: 19,
                                y : 11
                            }
                        }
                    },
                    position : {
                        corner : {
                            target: "bottomMiddle",
                            tooltip: "topRight"
                        },
                        adjust : {
                            screen : true,
                            scroll : false,
                            mouse: false
                        }
                    },
                    api: {
                        onRender: function() {
                            var me = this;
                            $(this.elements.content).find(".save_as_current").bind('click', function(e) {
                                self.saveChanges(e);
                                me.hide();
                            });
                            $(this.elements.content).find(".save_as_new").bind('click', function(e) {
                                self.workfileNewVersion(e);
                                me.hide();
                            });
                        }

                    }
                });
            },

            saveChanges: function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger("file:saveCurrent");
                this.updateAutosaveText("workfile.content_details.save");
            },

            workfileNewVersion : function(e) {
                e.preventDefault();
                this.trigger("file:createWorkfileNewVersion");
            },

            formatTime: function(time) {
                var hours = time.getHours();
                var minutes = time.getMinutes();

                var suffix = "AM";
                if (hours >= 12) {
                    suffix = "PM";
                    hours = hours - 12;
                }
                if (hours == 0) {
                    hours = 12;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                return hours + ":" + minutes + " " + suffix;
            }
        },
        {
            buildFor : function(model) {
                if (model.isImage()) {
                    return new ns.ImageWorkfileContentDetails({ model : model });
                }

                return new ns.WorkfileContentDetails({ model : model });
            }
        });
})(jQuery, chorus.views);
