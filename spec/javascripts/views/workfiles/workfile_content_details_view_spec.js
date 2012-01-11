describe("WorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workfile({});
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(true);
                spyOn(chorus.views, "ImageWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContentDetails).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is NOT an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(false);
                spyOn(chorus.views, "WorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor = chorus.views.WorkfileContentDetails.originalValue.buildFor;
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an WorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.WorkfileContentDetails).toHaveBeenCalledWith({ model : this.model });
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.WorkfileContentDetails({model : this.model});
            this.view.render();
        });

        it("has the three action links in the details bar", function() {
            expect(this.view.$("button").length).toBe(2);
        });

        it("should not have disabled class from the save as link", function() {
            expect(this.view.$(".save_as")).not.toHaveAttr("disabled");
        });

        it("should not display the autosave text", function() {
            expect(this.view.$("span.auto_save")).toHaveClass("hidden");
        });

        it("should show the save_options", function() {
            expect(this.view.$(".save_options")).toHaveClass("hidden");
        });
        
        context("when user is editing the file", function() {

            it("should display the save button", function() {
                expect(this.view.$(".save_as")).not.toHaveAttr("disabled");
            });

            context("and the autosave event is fired", function() {
                beforeEach(function() {
                    this.view.trigger("autosaved");
                });

                it("should display the autosave text", function() {
                    expect(this.view.$("span.auto_save")).not.toHaveClass("hidden");
                });

                context("and the save as current button is clicked", function() {
                    beforeEach(function() {
                        var event = $.Event("click");
                        this.view.saveChanges(event);
                    });

                    it("should display the 'Saved at' text", function() {
                        expect(this.view.$("span.auto_save").text()).toContain("Saved at");
                    });
                });
            });

            context("when user click on the 'save as file' button", function() {
                beforeEach(function() {
                    spyOn($.fn, 'qtip');
                    this.view.render();
                    this.view.$(".save_as").click();
                    this.qtipCall = $.fn.qtip.calls[0];
                });

                it("displays the tooltip", function() {
                    expect($.fn.qtip).toHaveBeenCalled();
                    expect(this.qtipCall.object).toBe(".save_as");
                });

                it("renders the tooltip content", function() {
                    expect(this.qtipCall.args[0].content).toContain("Save as new version");
                    expect(this.qtipCall.args[0].content).toContain("Replace current version");
                });
            });
        });
    });

    describe("#formatTime", function() {
        beforeEach(function() {
            this.view = new chorus.views.WorkfileContentDetails(this.model);
        });

        it("should format the time in the AM", function() {
            var date = new Date(1325876400 * 1000);
            expect(this.view.formatTime(date)).toBe("11:00 AM");
        });

        it("should format the time in the PM", function() {
            var date = new Date(1325908800 * 1000);
            expect(this.view.formatTime(date)).toBe("8:00 PM");
        });

        it("should format the time if it is Noon/Midnight", function() {
            var date = new Date(1325880000 * 1000);
            expect(this.view.formatTime(date)).toBe("12:00 PM");

            var date = new Date(1325836800 * 1000);
            expect(this.view.formatTime(date)).toBe("12:00 AM");
        });
    });
});
