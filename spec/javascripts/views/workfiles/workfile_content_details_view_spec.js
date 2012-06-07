describe("chorus.views.WorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = fixtures.workfile();
        this.model.workspace().set({ active: true });
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
                spyOn(chorus.views, "ArchivedWorkfileContentDetails");
                spyOn(chorus.views, "SqlWorkfileContentDetails");
            });

            context("when its workspace is active (not archived)", function() {
                it("instantiates a SqlWorkfileContentDetails view with the given workfile", function() {
                    spyOn(this.model.workspace(), 'isActive').andReturn(true);
                    chorus.views.WorkfileContentDetails.buildFor(this.model);
                    expect(chorus.views.SqlWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
                });
            });

            context("when its workspace is archived", function() {
                it("instantiates a ArchivedWorkfileContentDetails view with the given workfile", function() {
                    spyOn(this.model.workspace(), 'isActive').andReturn(false);
                    chorus.views.WorkfileContentDetails.buildFor(this.model);
                    expect(chorus.views.ArchivedWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
                });
            });
        });

        context("when the given workfile is an Alpine file", function() {
            beforeEach(function() {
                this.model = fixtures.alpineWorkfile();
                spyOn(chorus.views, "AlpineWorkfileContentDetails");
                this.view = chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an AlpineWorkfileContentDetails view with the given workfile", function() {
                expect(this.view).toBeA(chorus.views.AlpineWorkfileContentDetails);
            });
        });

        context("when the workfile is a binary file", function() {
            beforeEach(function() {
                this.model = fixtures.binaryWorkfile();
                spyOn(chorus.views, "BinaryWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates a BinaryWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.BinaryWorkfileContentDetails).toHaveBeenCalledWith({ model: this.model });
            });
        });

        context("when given anything else", function() {
            beforeEach(function() {
                fixtures.textWorkfile();
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
            this.saveFileMenu = stubQtip(".save_file_as");
            this.saveSelectionMenu = stubQtip(".save_selection_as");
            this.view = new chorus.views.WorkfileContentDetails({model: this.model});
            this.view.render();
        });

        it("has the save_file_as button in the details bar", function() {
            expect(this.view.$("button.save_file_as").length).toBe(1);
            expect(this.view.$("button.save_file_as")).toContainTranslation('workfile.content_details.save_file_as');
        });

        it("should not have disabled class from the save as link", function() {
            expect(this.view.$(".save_file_as")).not.toBeDisabled();
        });

        it("should not display the autosave text", function() {
            expect(this.view.$("span.auto_save")).toHaveClass("hidden");
        });

        context("menus", function() {
            it("when replacing the current version, it should broadcast the file:replaceCurrentVersion event", function() {
                spyOn(chorus.PageEvents, "broadcast");
                this.view.replaceCurrentVersion();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:replaceCurrentVersion");
            });

            it("when creating a new version, it should broadcast the file:createNewVersion event", function() {
                spyOn(chorus.PageEvents, "broadcast");
                this.view.createNewVersion();
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:createNewVersion");
            });
        });

        context("when the workspace is archived", function() {
            beforeEach(function() {
                this.model.workspace().set({ active: false });
                this.view.render();
            });

            it("should disable the save button", function() {
                expect(this.view.$(".save_file_as")).toBeDisabled();
                expect(this.view.$(".save_selection_as")).toBeDisabled();
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
                        this.view.$(".save_file_as").click();
                        this.saveFileMenu.find('a[data-menu-name="replace"]').click();
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
                        this.view.$(".save_file_as").click();
                    });

                    it("displays the tooltip", function() {
                        expect(this.saveFileMenu).toHaveVisibleQtip();
                    });

                    it("renders the menu links", function() {
                        expect(this.saveFileMenu).toContainTranslation("workfile.content_details.replace_current")
                        expect(this.saveFileMenu).toContainTranslation("workfile.content_details.save_new_version")
                        expect(this.saveFileMenu.find("a")).not.toHaveAttr("disabled");
                        // expect($("span.save_file_as_current.disabled", this.saveFileMenu)).not.toExist();
                    });
                });

                context("when the workfile is not the most recent version", function() {
                    beforeEach(function() {
                        this.view.model.set({ latestVersionNum: 2 })
                        this.view.render();
                        this.view.$(".save_file_as").click();
                    });

                    it("displays the tooltip", function() {
                        expect(this.saveFileMenu).toHaveVisibleQtip();
                    });

                    it("disables the link to replace version", function() {
                        expect(this.saveFileMenu.find("a[data-menu-name='replace']")).toHaveAttr("disabled");
                    });
                });
            });
        });

        describe("when the 'selectionPresent' page event is broadcasted", function() {
            beforeEach(function() {
                chorus.PageEvents.broadcast("file:selectionPresent");
            });

            it("switches the 'save' menu to display actions for the current selection", function() {
                expect(this.view.$("button.save_file_as")).toHaveClass("hidden");
                expect(this.view.$("button.save_selection_as")).not.toHaveClass("hidden");
            });

            describe("when the user clicks on the 'save selection as file' button", function() {
                beforeEach(function() {
                    spyOn(chorus.PageEvents, "broadcast");
                    this.view.$(".save_selection_as").click();
                });

                it("renders the menu links", function() {
                    expect(this.saveSelectionMenu).toContainTranslation("workfile.content_details.save_selection_new_version")
                    expect(this.saveSelectionMenu).toContainTranslation("workfile.content_details.replace_current_with_selection")
                });

                context("when the workfile is not the most recent version", function() {
                    it("disables the link to replace version", function() {
                        this.view.model.set({ latestVersionNum: 2 })
                        this.view.render();
                        this.view.$(".save_selection_as").click();

                        expect(this.saveSelectionMenu.find("a[data-menu-name='replace']")).toHaveAttr("disabled");
                    });
                });

                describe("when the 'save selection as new version' link is clicked", function() {
                    it("broadcasts the 'file:createNewVersionFromSelection'", function() {
                        this.saveSelectionMenu.find("a[data-menu-name='new']").click();
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:createNewVersionFromSelection");
                    });
                });

                describe("when the 'replace current version with selection' link is clicked", function() {
                    it("broadcasts the 'file:createNewVersionFromSelection'", function() {
                        this.saveSelectionMenu.find("a[data-menu-name='replace']").click();
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("file:replaceCurrentVersionWithSelection");
                    });

                    it("displays the saved at text", function() {
                        this.saveSelectionMenu.find("a[data-menu-name='replace']").click();
                        expect(this.view.$("span.auto_save").text()).toContain("Saved at");
                    })
                });
            });

            describe("when the 'selectionEmpty' page event is broadcasted", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("file:selectionEmpty");
                });

                it("switches the 'save' menu back", function() {
                    expect(this.view.$('.save_file_as')).not.toHaveClass("hidden");
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
