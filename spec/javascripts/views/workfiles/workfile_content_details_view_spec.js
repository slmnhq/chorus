describe("WorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile();
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                this.model = fixtures.imageWorkfile();
                spyOn(chorus.views, "ImageWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
            });
        });

        context("when the given workfile is a SQL file", function() {
            beforeEach(function() {
                this.model = fixtures.sqlWorkfile();
                spyOn(chorus.views, "SqlWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates a SqlWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.SqlWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
            });
        });

        context("when the given workfile is an Alpine file", function() {
            beforeEach(function() {
                this.model = fixtures.alpineWorkfile();
                spyOn(chorus.views, "AlpineWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an AlpineWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.AlpineWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
            });
        });

        context("when given anything else", function() {
            beforeEach(function() {
                fixtures.otherWorkfile();
                spyOn(chorus.views, "WorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor = chorus.views.WorkfileContentDetails.originalValue.buildFor;
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an WorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.WorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.qtipMenu = stubQtip();
            this.view = new chorus.views.WorkfileContentDetails({model: this.model});
            this.view.render();
        });

        it("has the save_as button in the details bar", function() {
            expect(this.view.$("button").length).toBe(1);
            expect(this.view.$("button")).toContainTranslation('workfile.content_details.save_as');
        });

        it("should not have disabled class from the save as link", function() {
            expect(this.view.$(".save_as")).not.toHaveAttr("disabled");
        });

        it("should not display the autosave text", function() {
            expect(this.view.$("span.auto_save")).toHaveClass("hidden");
        });

        it("should not show the save_options", function() {
            expect(this.view.$(".save_options")).toHaveClass("hidden");
        });

        context("menus", function() {
            it("when replacing the current version, it should broadcast the file:saveCurrent event", function() {
                spyOn(chorus.PageEvents, "broadcast");
                this.view.replaceCurrentVersion();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalled();
            });

            it("when creating a new version, it should broadcast the file:createWorkfileNewVersion event", function() {
                spyOn(chorus.PageEvents, "broadcast");
                this.view.workfileNewVersion();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalled();
            });
        });

        context("when user is editing the file", function() {
            context("and the autosave event is fired", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:autosaved");
                });

                it("should display the autosave text", function() {
                    expect(this.view.$("span.auto_save")).not.toHaveClass("hidden");
                });

                context("and the save as current button is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".save_as").click();
                        this.qtipMenu.find('.save_as_current').click();
                    });

                    it("should display the 'Saved at' text", function() {
                        expect(this.view.$("span.auto_save").text()).toContain("Saved at");
                    });
                });
            });

            context("when the user clicks on the 'save as file' button", function() {
                context("when the workfile is the most recent version", function() {
                    beforeEach(function() {
                        this.view.render();
                        this.view.$(".save_as").click();
                    });

                    it("displays the tooltip", function() {
                        expect(this.qtipMenu).toHaveVisibleQtip();
                    });

                    it("renders the menu links", function() {
                        expect($("a.save_as_new", this.qtipMenu)).toExist();
                        expect($("a.save_as_current", this.qtipMenu)).toExist();
                        expect($("span.save_as_current.disabled", this.qtipMenu)).not.toExist();
                    });
                });

                context("when the workfile is not the most recent version", function() {
                    beforeEach(function() {
                        this.view.model.set({ latestVersionNum: 2 })
                        this.view.render();
                        this.view.$(".save_as").click();
                    });

                    it("displays the tooltip", function() {
                        expect(this.qtipMenu).toHaveVisibleQtip();
                    });

                    it("renders the menu links", function() {
                        expect($("a.save_as_new", this.qtipMenu)).toExist();
                        expect($("a.save_as_current", this.qtipMenu)).not.toExist();
                        expect($("span.save_as_current.disabled", this.qtipMenu)).toExist();
                    });
                })
            })
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
