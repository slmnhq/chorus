describe("chorus.dialogs.MemoNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='workfile' data-allow-workspace-attachments='true' data-entity-id='1' data-workspace-id='22'></a>")
        this.model = new chorus.models.Comment({
            entityType:this.launchElement.data("entity-type"),
            entityId:this.launchElement.data("entity-id"),
            workspaceId: this.launchElement.data("workspace-id")
        });
        this.dialog = new chorus.dialogs.MemoNew({
            launchElement : this.launchElement,
            pageModel : new chorus.models.Workfile(),
            model: this.model
        });

        spyOn($.fn, 'fileupload');
        spyOn(this.dialog, "launchSubModal")
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

    describe("#render", function() {
        it("renders the body", function() {
            this.dialog.model.set({body : "cats"})
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats")
        });

        it("has the 'Show options' link", function() {
            expect(this.dialog.$('a.show_options').length).toBe(1);
            expect(this.dialog.$('a.show_options').text()).toMatchTranslation('notes.new_dialog.show_options');
        });

        it("should have a notification recipients subview", function() {
            expect(this.dialog.$(this.dialog.notifications.el)).toExist();
            expect(this.dialog.notifications).toBeA(chorus.views.NotificationRecipient);
        });

        it("has a 'Send Notifications To' link", function() {
            expect(this.dialog.$(".recipients_menu")).not.toHaveClass("hidden");
        });

        it("hides the notification content area by default", function() {
            expect(this.dialog.$(".notification_recipients")).toHaveClass("hidden");
        });

        describe("selecting recipients", function() {
            beforeEach(function() {
                this.dialog.recipients.trigger("choice", "choice", "some");
                this.dialog.$("textarea[name=body]").val("blah");
            });

            it("should display the notification content area", function() {
                expect(this.dialog.$(".notification_recipients")).not.toHaveClass("hidden");
            });

            context("with selected recipients", function() {
                beforeEach(function() {
                    spyOn(this.dialog.notifications, "getPickedUsers").andReturn(["1", "2"]);
                    this.dialog.save();
                });

                it("should include the recipients in the save request", function() {
                    expect(this.server.lastCreate().params().recipients).toBe("1,2");
                });
            });

            describe("selecting 'Nobody'", function() {
                beforeEach(function() {
                    this.dialog.recipients.trigger("choice", "choice", "none");
                });

                it("should hide the notification content area", function() {
                    expect(this.dialog.$(".notification_recipients")).toHaveClass("hidden");
                });

                context("with a selected user", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.notifications, "getPickedUsers").andReturn(["1", "2"]);
                        this.dialog.save();
                    });

                    it("should not include the recipients in the save request", function() {
                        expect(this.server.lastCreate().params().recipients).toBeFalsy();
                    });
                });
            });
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

        it("renders the workfiles attachment link and dataset attachment link when the allowWorkfileAttachments data is truthy", function() {
            expect(this.dialog.$("a.add_workfile")).toExist();
            expect(this.dialog.$("a.add_dataset")).toExist();
        });

        it("doesn't render the workfiles attachment link or the dataset attachment link when the allowWorkfileAttachments data is falsy", function() {
            this.launchElement.data("allowWorkspaceAttachments", false);
            this.dialog.render();
            expect(this.dialog.$("a.add_workfile")).not.toExist();
            expect(this.dialog.$("a.add_dataset")).not.toExist();
        });

        it("prevents default on click", function() {
            var eventSpy = jasmine.createSpyObj("event", ['preventDefault']);
            this.dialog.showOptions(eventSpy);
            expect(eventSpy.preventDefault).toHaveBeenCalled();
        });

        describe("when the 'attach workfile' link is clicked", function() {
            beforeEach(function() {
                this.dialog.$('.show_options').click();
                this.fakeModal = stubModals();
                this.dialog.launchSubModal.andCallThrough();
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
                    this.workfileSet = new chorus.collections.WorkfileSet([
                        new chorus.models.Workfile({ id: 1, fileName: "greed.sql", fileType: "sql" }),
                        new chorus.models.Workfile({ id: 2, fileName: "generosity.cpp", fileType: "cpp" })
                    ]);
                    this.workfilesDialog = chorus.dialogs.WorkfilesAttach.prototype.render.mostRecentCall.object;
                    this.workfilesDialog.trigger("files:selected", this.workfileSet);
                });

                it("displays the names of the workfiles", function() {
                    var fileNames = this.dialog.$(".file_details .name");
                    expect(fileNames.eq(0).text()).toBe("greed.sql");
                    expect(fileNames.eq(1).text()).toBe("generosity.cpp");
                });

                it("displays the appropriate file icons", function() {
                    var fileIcons = this.dialog.$(".file_details:visible img.icon");
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
                        expect(options.selectedAttachments.models[0].get('fileName')).toBe('greed.sql');
                        expect(options.selectedAttachments.models[1].get('fileName')).toBe('generosity.cpp');
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

        describe("when the 'attach dataset' link is clicked", function() {
            beforeEach(function() {
                this.dialog.$('.show_options').click();
                this.fakeModal = stubModals();
                this.dialog.launchSubModal.andCallThrough();
                spyOn(chorus.dialogs.DatasetsAttach.prototype, 'render').andCallThrough();
                this.dialog.$("a.add_dataset").click();
            });

            it("launches the dataset picker dialog", function() {
                expect(this.fakeModal).toHaveBeenCalled();
                expect(chorus.dialogs.DatasetsAttach.prototype.render).toHaveBeenCalled();

                var modalElement = this.fakeModal.mostRecentCall.args[0];
                var view = chorus.dialogs.DatasetsAttach.prototype.render.mostRecentCall.object;

                expect(modalElement).toBe(view.el);
                expect(view.options.workspaceId).toBe(22);
            });

            describe("when datasets are selected", function() {
                beforeEach(function() {
                    this.datasetSet = new chorus.collections.DatasetSet([
                        fixtures.datasetSandboxTable({objectName: 'table1', id: '1'}),
                        fixtures.datasetSandboxTable({objectName: 'table2', id: '2'})
                    ]);
                    this.datasetsDialog = chorus.dialogs.DatasetsAttach.prototype.render.mostRecentCall.object;
                    this.datasetsDialog.trigger("datasets:selected", this.datasetSet);
                });

                it("displays the names of the datasets", function() {
                    var datasetNames = this.dialog.$(".dataset_details .name");
                    expect(datasetNames.eq(0).text()).toBe("table1");
                    expect(datasetNames.eq(1).text()).toBe("table2");
                });

                it("displays the appropriate icons", function() {
                    var datasetIcons = this.dialog.$(".dataset_details:visible img.icon");
                    expect(datasetIcons.eq(0).attr("src")).toBe(this.datasetSet.at(0).iconUrl({size: 'medium'}));
                    expect(datasetIcons.eq(0).attr("src")).toBe(this.datasetSet.at(1).iconUrl({size: 'medium'}));
                });

                it("stores the collection", function() {
                    expect(this.dialog.model.datasets).toBe(this.datasetSet);
                });

                context("when the 'attach dataset' link is clicked again", function() {
                    beforeEach(function() {
                        spyOn(chorus.dialogs.DatasetsAttach.prototype, 'initialize').andCallThrough();
                        this.dialog.$("a.add_dataset").click();
                    });

                    it("is populated with the previously selected datasets", function() {
                        expect(chorus.dialogs.DatasetsAttach.prototype.initialize).toHaveBeenCalled();
                        var options = chorus.dialogs.DatasetsAttach.prototype.initialize.mostRecentCall.args[0];
                        expect(options.selectedAttachments.models[0].get('objectName')).toBe('table1');
                        expect(options.selectedAttachments.models[1].get('objectName')).toBe('table2');
                    });
                    context("when new datasets are selected", function() {
                        beforeEach(function() {
                            this.datasetsDialog = chorus.dialogs.DatasetsAttach.prototype.render.mostRecentCall.object;
                            this.datasetsDialog.trigger("datasets:selected", this.datasetSet);
                        });

                        it("clears any existing datasets", function() {
                            expect(this.dialog.$(".dataset_details").length).toBe(2);
                        });
                    })
                })

                describe("when a dataset remove link is clicked", function() {
                    it("removes only that dataset", function() {
                        var table1Row = this.dialog.$(".dataset_details:contains('table1')")
                        var table2Row = this.dialog.$(".dataset_details:contains('table2')")

                        expect(table1Row).toExist();
                        expect(table2Row).toExist();

                        table2Row.find("a.remove").click();

                        table1Row = this.dialog.$(".dataset_details:contains('table1')")
                        table2Row = this.dialog.$(".dataset_details:contains('table2')")
                        expect(table1Row).toExist();
                        expect(table2Row).not.toExist();
                    });

                    it("removes only that dataset from the collection", function() {
                        var table1Row = this.dialog.$(".dataset_details:contains('table1')")
                        table1Row.find("a.remove").click();
                        expect(this.dialog.model.datasets.get("1")).toBeUndefined();
                        expect(this.dialog.model.datasets.get("2")).not.toBeUndefined();
                    });
                });
            });
        });

        context("when a desktop files have been chosen", function() {
            beforeEach(function() {
                this.dialog.$('.show_options').click();
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
                spyOn(this.dialog.model, 'addFileUpload').andCallThrough();
                this.fileUploadOptions = $.fn.fileupload.mostRecentCall.args[0];
                this.request = jasmine.createSpyObj('request', ['abort']);
                _.each(this.fileList, _.bind(function(file) {
                    this.fileUploadOptions.add(null, {files: [file], submit: jasmine.createSpy().andReturn(this.request)});
                }, this));
            });

            it("has a dataType of 'json'", function() {
                expect(this.fileUploadOptions.dataType).toBe('json');
            });

            it("uses updateProgressBar as a progress function", function() {
                expect(this.fileUploadOptions.progress).toBe(this.dialog.updateProgressBar);
            });

            it("points the dropzone to the file input to avoid insanity", function() {
                expect(this.fileUploadOptions.dropZone).toBe(this.dialog.$("input[type=file]"))
            })

            it("unhides the file_details area", function() {
                expect(this.dialog.$('.file_details')).toBeVisible();
            });

            it("displays the chosen filenames", function() {
                expect(this.dialog.$(".file_details .name:eq(0)").text()).toBe("foo.bar");
                expect(this.dialog.$(".file_details .name:eq(1)").text()).toBe("baz.sql");
            });

            it("displays the appropriate file icons", function() {
                expect(this.dialog.$(".file_details img.icon:eq(0)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("bar", "medium"));
                expect(this.dialog.$(".file_details img.icon:eq(1)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("sql", "medium"));
            });

            it("creates dependent commentFileUpload object for each upload", function() {
                expect(this.dialog.model.addFileUpload.callCount).toBe(this.fileList.length);
            });

            it("attaches the rendered file_details element to the file data element", function() {
                expect(this.dialog.model.files[0].data.fileDetailsElement.get(0)).toEqual(this.dialog.$('.file_details:eq(0)').get(0));
            });

            describe("updateProgressBar", function() {
                beforeEach(function() {
                    var data = {
                        fileDetailsElement: this.dialog.$('.file_details:eq(0)'),
                        total: 100,
                        loaded: 25
                    }
                    this.dialog.initProgressBars();
                    this.dialog.updateProgressBar("", data);
                });

                it("adjusts the visiblity of the progress bar", function() {
                    var loadingBar = this.dialog.$('.file_details:eq(0) .progress_bar span');
                    expect(loadingBar.css('right')).toBe('75px');
                });

                context("when the upload has finished", function() {
                    beforeEach(function() {
                        var data = {
                            fileDetailsElement: this.dialog.$('.file_details:eq(0)'),
                            total: 100,
                            loaded: 100
                        }
                        this.dialog.updateProgressBar("", data);
                    });

                    it("shows upload_finished and hides the progress bar", function() {
                        var fileRow = this.dialog.$('.file_details:eq(0)');
                        expect(fileRow.find('.progress_bar span')).not.toBeVisible();
                        expect(fileRow.find('.upload_finished')).toBeVisible();
                    })
                });
            })

            context("when a selected file is removed", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, 'removeFileUpload');
                    this.uploadModelToRemove = this.dialog.model.files[1];
                    this.dialog.$(".file_details .remove:eq(1)").click();
                });

                it("removes the file details", function() {
                    expect(this.dialog.$('.file_details').length).toBe(1);
                });

                it("removes the commentFileUpload from the model", function() {
                    expect(this.dialog.model.removeFileUpload).toHaveBeenCalledWith(this.uploadModelToRemove);
                });
            });

            describe("when a workfile is selected later", function() {
                beforeEach(function() {
                    this.workfileSet = new chorus.collections.WorkfileSet([
                        new chorus.models.Workfile({ id: 1, fileName: "greed.sql", fileType: "sql" }),
                        new chorus.models.Workfile({ id: 2, fileName: "generosity.cpp", fileType: "cpp" })
                    ]);
                    this.dialog.workfileChosen(this.workfileSet);
                });

                it("does not remove the desktop files from the view", function() {
                    expect(this.dialog.$(".file_details .name:eq(0)").text()).toBe("foo.bar");
                    expect(this.dialog.$(".file_details .name:eq(1)").text()).toBe("baz.sql");
                });

                describe("initProgressBars", function() {
                    context("with fileProgress support", function() {
                        beforeEach(function() {
                            chorus.features.fileProgress = true;
                            this.dialog.initProgressBars();
                        });
                        it("shows the progress bar for desktopfiles", function() {
                            this.dialog.$(".file_details.desktopfile").each(function() {
                                expect($(this).find('.progress_bar')).toBeVisible();
                                expect($(this).find('.progress_text')).not.toBeVisible();
                                expect($(this).find('.remove')).not.toBeVisible();
                                expect($(this).find('.upload_finished')).not.toBeVisible();
                            })
                        });

                        it("shows the upload_finished for workfiles", function() {
                            this.dialog.$(".file_details.workfile").each(function() {
                                expect($(this).find('.progress_bar')).not.toBeVisible();
                                expect($(this).find('.remove')).not.toBeVisible();
                                expect($(this).find('.upload_finished')).toBeVisible();
                            })
                        });
                    })
                    context("without fileProgress support", function() {
                        beforeEach(function() {
                            chorus.features.fileProgress = false;
                            this.dialog.initProgressBars();
                        });
                        afterEach(function() {
                            chorus.features.fileProgress = true;
                        })
                        it("shows the progress text for desktopfiles", function() {
                            this.dialog.$(".file_details.desktopfile").each(function() {
                                expect($(this).find('.progress_text')).toBeVisible();
                                expect($(this).find('.progress_bar')).not.toBeVisible();
                                expect($(this).find('.remove')).not.toBeVisible();
                                expect($(this).find('.upload_finished')).not.toBeVisible();
                            })
                        });
                    })

                })
            });

            describe("submit", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "closeModal");
                    this.dialog.$("textarea[name=body]").val("The body of a note");
                    spyOnEvent(this.dialog.pageModel, "invalidated");
                    spyOn(this.dialog.model, 'saveFiles');
                    spyOn(this.dialog, 'initProgressBars').andCallThrough();
                    spyOn($.fn, "stopLoading").andCallThrough();
                    this.dialog.saving = true;
                });

                describe("when the model save succeeds", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saved");
                    });

                    it("does triggers a file upload", function() {
                        expect(this.dialog.model.saveFiles).toHaveBeenCalled();
                    });

                    it("does trigger the progress bar initialization", function() {
                        expect(this.dialog.initProgressBars).toHaveBeenCalled();
                    })

                    context("when the file upload succeeds", function() {
                        beforeEach(function() {
                            this.dialog.model.trigger("fileUploadSuccess");
                        });

                        it("closes the dialog box", function() {
                            expect(this.dialog.closeModal).toHaveBeenCalled();
                        });

                        it("triggers the 'invalidated' event on the model", function() {
                            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
                        });

                        it("removes the spinner from the button", function() {
                            expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit")
                        });
                    });

                    context("when the file upload fails", function() {
                        beforeEach(function() {
                            this.dialog.model.trigger("fileUploadFailed");
                        });

                        it("does not close the dialog box", function() {
                            expect(this.dialog.closeModal).not.toHaveBeenCalled();
                        })

                        it("does not trigger the 'invalidated' event on the model", function() {
                            expect("invalidated").not.toHaveBeenTriggeredOn(this.dialog.pageModel);
                        });

                        it("removes the spinner from the button", function() {
                            expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit")
                        });

                        it("displays the remove button and hides progress bar", function() {
                            this.dialog.$(".file_details").each(function() {
                                expect($(this).find('.progress_bar')).not.toBeVisible();
                                expect($(this).find('.upload_finished')).not.toBeVisible();
                                expect($(this).find('.remove')).toBeVisible();
                            })
                        });

                        it("enables the attachment_links", function() {
                            expect(this.dialog.$('.attachment_links')).not.toHaveClass('disabled');
                        })

                        it("enables the workfile attachment", function() {
                            this.dialog.$(".add_workfile").click();
                            expect(this.dialog.launchSubModal).toHaveBeenCalled();
                        })
                    });

                    context("when the upload is cancelled by clicking 'cancel upload button'", function() {
                        beforeEach(function() {
                            _.each(this.dialog.model.files, function(fileModel) {
                                spyOn(fileModel, 'cancelUpload');
                            })
                            this.dialog.$('.cancel_upload').click();
                        })

                        it("calls cancelUpload on the file models", function() {
                            _.each(this.dialog.model.files, function(fileModel) {
                                expect(fileModel.cancelUpload).toHaveBeenCalled();
                            })
                        })
                    });

                    context("when the upload is cancelled by pressing escape key", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, 'cancelUpload');
                            this.dialog.escapePressed();
                        })

                        it("calls cancelUpload on the file models", function() {
                            expect(this.dialog.cancelUpload).toHaveBeenCalled();
                        })
                    });
                });
                describe("when the model save fails", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saveFailed");
                    })

                    it("does not close the dialog box", function() {
                        expect(this.dialog.closeModal).not.toHaveBeenCalled();
                    })

                    it("does not trigger the 'invalidated' event on the model", function() {
                        expect("invalidated").not.toHaveBeenTriggeredOn(this.dialog.pageModel);
                    });

                    it("removes the spinner from the button", function() {
                        expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit")
                    });

                    it("does not trigger a file upload", function() {
                        expect(this.dialog.model.saveFiles).not.toHaveBeenCalled();
                    });
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
            this.dialog.notifications.pickedUsers = ['1', '2'];
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function() {
            expect(this.dialog.model.get("body")).toBe("The body of a note")
            expect(this.dialog.model.get("workspaceId")).toBe(22);
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
            spyOnEvent(this.dialog.pageModel, "invalidated");
            this.dialog.model.trigger("saved");
            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
        })

        it("disables the attachment_links", function() {
            expect(this.dialog.$('.attachment_links')).toHaveClass('disabled');
        })

        it("prevents workfiles from being selected", function() {
            this.dialog.$(".add_workfile").click();
            expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
        })

        it("prevents datasets from being selected", function() {
            this.dialog.$(".add_dataset").click();
            expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
        })
    });

    describe("saveFailed", function() {
        beforeEach(function() {
            spyOn(this.dialog, 'showErrors');
            spyOn(this.dialog.model, 'destroy');
        });

        context("the model was saved", function() {
            beforeEach(function() {
                this.dialog.model.set({'id': fixtures.nextId().toString()});
                this.dialog.saveFailed();
            });

            it("destroys the comment", function() {
                expect(this.dialog.model.destroy).toHaveBeenCalled();
            });

            it("clears the id", function() {
                expect(this.dialog.model.get('id')).toBeUndefined();
            });

            it("calls showErrors", function() {
                expect(this.dialog.showErrors).toHaveBeenCalled();
            });
        });

        context("the model was not saved", function() {
            beforeEach(function() {
                expect(this.dialog.model.get('id')).not.toBeDefined();
                this.dialog.saveFailed();
            });

            it("does not destroy the comment", function() {
                expect(this.dialog.model.destroy).not.toHaveBeenCalled();
            });

            it("calls showErrors", function() {
                expect(this.dialog.showErrors).toHaveBeenCalled();
            });
        });
    });

    describe("Cancel", function() {
        context("while uploading is going on", function() {
            beforeEach(function() {
                spyOn(this.dialog.model, 'saveFiles');
                this.dialog.model.files = [
                    {}
                ];
                this.dialog.modelSaved();
            });

            it("cancel should be replaced by cancel upload button", function() {
                expect(this.dialog.$('.modal_controls .cancel')).not.toBeVisible();
                expect(this.dialog.$('.modal_controls .cancel_upload')).toBeVisible();
            });

            context("when the upload has failed", function() {
                beforeEach(function() {
                    this.dialog.model.trigger('fileUploadFailed');
                });

                it("should hide the cancel upload button again", function() {
                    expect(this.dialog.$('.modal_controls .cancel')).toBeVisible();
                    expect(this.dialog.$('.modal_controls .cancel_upload')).not.toBeVisible();
                })

            });
        })
    })
});
