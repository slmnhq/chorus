describe("NotesNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='workfile' data-allow-workfile-attachments='true' data-entity-id='1' data-workspace-id='22'></a>")
        this.dialog = new chorus.dialogs.NotesNew({
            launchElement : this.launchElement,
            pageModel : new chorus.models.Workfile()
        });
        spyOn($.fn, 'fileupload');
        this.dialog.render();
        $('#jasmine_content').append(this.dialog.el);
    });

    afterEach(function() {
        //prevent submodal test pollution
        $(document).unbind("close.facebox");
    })

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        it("creates the correct Note", function() {
            expect(this.dialog.model.get("entityType")).toBe("workfile")
            expect(this.dialog.model.get("entityId")).toBe(1)
        });
    });

    describe("#render", function() {

        it("has the right title", function() {
            expect($(this.dialog.el).attr("title")).toBe(t("notes.new_dialog.title"));
        });
        it("renders the body", function() {
            this.dialog.model.set({body : "cats"})
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats")
        });

        it("has the right placeholder", function() {
            expect(this.dialog.$("textarea[name=body]").attr("placeholder")).toBe(t("notes.placeholder", {noteSubject: "workfile"}));
        });

        it("has the 'Show options' link", function() {
            expect(this.dialog.$('a.show_options').length).toBe(1);
            expect(this.dialog.$('a.show_options').text()).toMatchTranslation('notes.new_dialog.show_options');
        });
    });

    describe("show_options", function() {
        it("shows the options area and hides the options_text when clicked", function() {
            expect(this.dialog.$('.options_area')).toBeHidden();
            expect(this.dialog.$('.options_text')).toBeVisible();
            this.dialog.$("a.show_options").click();
            expect(this.dialog.$('.options_text')).toBeHidden();
            expect(this.dialog.$('.options_area')).toBeVisible();
        });

        it("renders the workfiles attachment link when the workfilesAttachment data is truthy", function() {
            expect(this.dialog.$("a.add_workfile")).toExist();
        });

        it("doesn't render the workfiles attachment link when the workfilesAttachment data is falsy", function() {
            this.launchElement.data("allowWorkfileAttachments", false);
            this.dialog.render();
            expect(this.dialog.$("a.add_workfile")).not.toExist();
        });

        it("prevents default on click", function() {
            var eventSpy = jasmine.createSpyObj("event", ['preventDefault']);
            this.dialog.showOptions(eventSpy);
            expect(eventSpy.preventDefault).toHaveBeenCalled();
        });

        describe("when the 'attach workfile' link is clicked", function() {
            beforeEach(function() {
                this.fakeModal = stubModals();
                spyOn(chorus.dialogs.WorkfilesAttach.prototype, 'render').andCallThrough();
                this.dialog.$("a.add_workfile").click();
            });

            it("launches the workfile picker dialog", function() {
                expect(this.fakeModal).toHaveBeenCalled();
                expect(chorus.dialogs.WorkfilesAttach.prototype.render).toHaveBeenCalled();

                var modalElement = this.fakeModal.mostRecentCall.args[0];
                var view = chorus.dialogs.WorkfilesAttach.prototype.render.mostRecentCall.object;

                expect(modalElement).toBe(view.el);
                expect(view.options.workspaceId).toBe(22);
            });

            describe("when workfiles are selected", function() {
                beforeEach(function() {
                    this.workfileSet = new chorus.models.WorkfileSet([
                        new chorus.models.Workfile({ id: 1, fileName: "greed.sql", fileType: "sql" }),
                        new chorus.models.Workfile({ id: 2, fileName: "generosity.cpp", fileType: "cpp" })
                    ]);
                    this.workfilesDialog = chorus.dialogs.WorkfilesAttach.prototype.render.mostRecentCall.object;
                    this.workfilesDialog.trigger("files:selected", this.workfileSet);
                });

                it("displays the names of the workfiles", function() {
                    var fileNames = this.dialog.$(".file_details .file_name");
                    expect(fileNames.eq(0).text()).toBe("greed.sql");
                    expect(fileNames.eq(1).text()).toBe("generosity.cpp");
                });

                it("displays the appropriate file icons", function() {
                    var fileIcons = this.dialog.$(".file_details:not('.hidden') img");
                    expect(fileIcons.eq(0).attr("src")).toBe(chorus.urlHelpers.fileIconUrl("sql", "medium"));
                    expect(fileIcons.eq(1).attr("src")).toBe(chorus.urlHelpers.fileIconUrl("cpp", "medium"));
                });

                it("stores the collection", function() {
                    expect(this.dialog.model.workfiles).toBe(this.workfileSet);
                });

                context("when the 'attach workfile' link is clicked again", function() {
                    beforeEach(function() {
                        spyOn(chorus.dialogs.WorkfilesAttach.prototype, 'initialize').andCallThrough();
                        this.dialog.$("a.add_workfile").click();
                    });

                    it("is populated with the previously selected workfiles", function() {
                        expect(chorus.dialogs.WorkfilesAttach.prototype.initialize).toHaveBeenCalled();
                        var options = chorus.dialogs.WorkfilesAttach.prototype.initialize.mostRecentCall.args[0];
                        expect(options.selectedFiles.models[0].get('fileName')).toBe('greed.sql');
                        expect(options.selectedFiles.models[1].get('fileName')).toBe('generosity.cpp');
                    });
                    context("when new files are selected", function() {
                        beforeEach(function() {
                            this.workfilesDialog = chorus.dialogs.WorkfilesAttach.prototype.render.mostRecentCall.object;
                            this.workfilesDialog.trigger("files:selected", this.workfileSet);
                        });

                        it("clears any existing workfiles", function() {
                            expect(this.dialog.$(".file_details").length).toBe(2);
                        });
                    })
                })

                describe("when a workfile remove link is clicked", function() {
                    it("removes only that workfile", function() {
                        var sqlRow = this.dialog.$(".file_details:not('.hidden'):contains('sql')")
                        var cppRow = this.dialog.$(".file_details:contains('cpp')")

                        expect(sqlRow).toExist();
                        expect(cppRow).toExist();

                        sqlRow.find("a.remove").click();

                        sqlRow = this.dialog.$(".file_details:contains('sql')")
                        cppRow = this.dialog.$(".file_details:contains('cpp')")
                        expect(sqlRow).not.toExist();
                        expect(cppRow).toExist();
                    });

                    it("removes only that workfile from the collection", function() {
                        var sqlRow = this.dialog.$(".file_details:contains('sql')")
                        sqlRow.find("a.remove").click();
                        expect(this.dialog.model.workfiles.get("1")).toBeUndefined();
                        expect(this.dialog.model.workfiles.get("2")).not.toBeUndefined();
                    });

                    context("when a desktop file has already been chosen", function() {
                        beforeEach(function() {
                            this.uploadObj = jasmine.createSpyObj("uploadObj", ["submit"]);
                            this.dialog.model.uploadObj = this.uploadObj;
                        });

                        it("does not remove the desktop file", function() {
                            var sqlRow = this.dialog.$(".file_details:contains('sql')")
                            sqlRow.find("a.remove").click();

                            expect(this.dialog.model.uploadObj).toBe(this.uploadObj);
                        });
                    });
                });
            });
        });

        context("when a desktop files have been chosen", function() {
            beforeEach(function() {
                this.dialog.$("a.show_options").click();
                this.fileList = [
                    {
                        name: 'foo.bar'
                    },
                    {
                        name: 'baz.sql'
                    }
                ];
                expect($.fn.fileupload).toHaveBeenCalled();
                expect($.fn.fileupload).toHaveBeenCalledOnSelector('input[type=file]');
                this.fileUploadOptions = $.fn.fileupload.mostRecentCall.args[0];
                this.request = jasmine.createSpyObj('request', ['abort']);
                this.fileUploadOptions.add(null, {files: this.fileList, submit: jasmine.createSpy().andReturn(this.request)});
            });

            it("has a dataType of 'text' for FF3.6 support", function() {
                expect(this.fileUploadOptions.dataType).toBe('text');
            });

            it("points the dropzone to the file input to avoid insanity", function() {
                expect(this.fileUploadOptions.dropZone).toBe(this.dialog.$("input[type=file]"))
            })

            it("unhides the file_details area", function() {
                expect(this.dialog.$('.file_details')).toBeVisible();
            });

            it("displays the chosen filenames", function() {
                expect(this.dialog.$(".file_details .file_name:eq(0)").text()).toBe("foo.bar");
                expect(this.dialog.$(".file_details .file_name:eq(1)").text()).toBe("baz.sql");
            });

            it("displays the appropriate file icons", function() {
                expect(this.dialog.$(".file_details img:eq(0)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("bar", "medium"));
                expect(this.dialog.$(".file_details img:eq(1)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("sql", "medium"));
            });

            it("sets uploadObj on the model", function() {
                expect(this.dialog.model.uploadObj).toBeDefined();
            });

            context("when a selected file is removed", function() {
                beforeEach(function() {
                    this.dialog.$(".file_details .remove:eq(1)").click();
                });

                it("removes the file details", function() {
                    expect(this.dialog.$('.file_details').length).toBe(1);
                });

                it("removes the uploadObj from the model only if all uploads have been removed", function() {
                    expect(this.dialog.model.uploadObj).toBeDefined();
                    this.dialog.$(".file_details .remove:eq(0)").click();
                    expect(this.dialog.model.uploadObj).toBeUndefined();
                });
            });

            describe("when a workfile is selected later", function() {
                beforeEach(function() {
                    this.workfileSet = new chorus.models.WorkfileSet([
                        new chorus.models.Workfile({ id: 1, fileName: "greed.sql", fileType: "sql" }),
                        new chorus.models.Workfile({ id: 2, fileName: "generosity.cpp", fileType: "cpp" })
                    ]);
                    this.dialog.workfileChosen(this.workfileSet);
                });

                it("does not remove the desktop files from the view", function() {
                    expect(this.dialog.$(".file_details .file_name:eq(0)").text()).toBe("foo.bar");
                    expect(this.dialog.$(".file_details .file_name:eq(1)").text()).toBe("baz.sql");
                });
            });

            describe("submit", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "closeModal");
                    this.dialog.$("textarea[name=body]").val("The body of a note");
                    this.invalidatedSpy = jasmine.createSpy("invalidated");
                    this.dialog.pageModel.bind("invalidated", this.invalidatedSpy);
                    spyOn($.fn, "stopLoading").andCallThrough();
                });

                describe("when the upload succeeds", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saved");
                    })

                    it("closes the dialog box", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                    });

                    it("triggers the 'invalidated' event on the model", function() {
                        expect(this.invalidatedSpy).toHaveBeenCalled();
                    });

                    it("removes the spinner from the button", function() {
                        expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit")
                    })
                });

                describe("when the upload fails", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saveFailed");
                    })

                    it("does not close the dialog box", function() {
                        expect(this.dialog.closeModal).not.toHaveBeenCalled();
                    })

                    it("does not trigger the 'invalidated' event on the model", function() {
                        expect(this.invalidatedSpy).not.toHaveBeenCalled();
                    });

                    it("removes the spinner from the button", function() {
                        expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit")
                    })
                });

                describe("when the validation fails", function() {
                    beforeEach(function() {
                        this.dialog.$("textarea[name=body]").val("");
                        this.dialog.$('button.submit').click();
                        $('#jasmine_content').append(this.dialog.el);
                    })

                    it("removes the spinner from the button", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    })
                });
            });
        });
    });

    describe("submit", function() {
        beforeEach(function() {
            spyOn(this.dialog.model, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            this.dialog.$("textarea[name=body]").val("The body of a note");
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function() {
            expect(this.dialog.model.get("body")).toBe("The body of a note")
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("starts a spinner", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        })

        it("closes the dialog box if saved successfully", function() {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("doesn't close the dialog box if it not saved successfully", function() {
            this.dialog.model.trigger("savedFailed");
            expect(this.dialog.closeModal).not.toHaveBeenCalled();
        });

        it("trims the note", function() {
            this.dialog.$("textarea[name=body]").val("  trim me  ");
            this.dialog.$("form").trigger("submit");
            expect(this.dialog.model.get("body")).toBe("trim me")
        });

        it("triggers the 'invalidated' event on the model", function() {
            var invalidatedSpy = jasmine.createSpy("invalidated");
            this.dialog.pageModel.bind("invalidated", invalidatedSpy);
            this.dialog.model.trigger("saved");
            expect(invalidatedSpy).toHaveBeenCalled();
        })
    });
});
