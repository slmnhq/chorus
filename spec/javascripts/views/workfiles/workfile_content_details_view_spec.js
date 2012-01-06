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
            this.view = new chorus.views.WorkfileContentDetails(this.model);
            this.view.render();
        });

        it("has the three action links in the details bar", function() {
            expect(this.view.$("button").length).toBe(3);
        });

        it("should disabled class from the save as link", function() {
            expect(this.view.$(".save_as")).toHaveAttr("disabled");
        });

        it("should not display the autosave text", function() {
            expect(this.view.$("span.auto_save")).toHaveClass("hidden");
        });
        
        context("when user click on the edit file button", function() {
            beforeEach(function() {
                this.fileSpy = jasmine.createSpy("file:edit");
                this.view.bind("file:edit", this.fileSpy);
                this.view.$(".edit_file").click();
            });

            it("should trigger file edit", function() {
                expect(this.fileSpy).toHaveBeenCalled();
            });

            it("should apply the disabled class to the edit button", function() {
                expect(this.view.$(".edit_file")).toHaveAttr("disabled");
            });

            it("should remove the disabled class from the save as button", function() {
                expect(this.view.$(".save_as")).not.toHaveAttr("disabled");
            });

            context("and the autosave event is fired", function() {
                beforeEach(function() {
                    this.view.trigger("autosaved");
                });

                it("should display the autosave text", function() {
                    expect(this.view.$("span.auto_save")).not.toHaveClass("hidden");
                });

                context("and the save file button is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".save_as").click();
                    });

                    it("should not display the autosave text", function() {
                        expect(this.view.$("span.auto_save")).toHaveClass("hidden");
                    });
                });
            });

            context("when user click on the save file button", function() {
                beforeEach(function() {
                    this.fileSpy = jasmine.createSpy("file:save");
                    this.view.bind("file:save", this.fileSpy);
                    this.view.$(".save_as").click();
                });

                it("should trigger file save", function() {
                    expect(this.fileSpy).toHaveBeenCalled();
                });

                it("should apply the disabled class to the save button", function() {
                    expect(this.view.$(".save_as")).toHaveAttr("disabled");
                });

                it("should apply the disabled class from the edit button", function() {
                    expect(this.view.$(".save_as")).toHaveAttr("disabled");
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
