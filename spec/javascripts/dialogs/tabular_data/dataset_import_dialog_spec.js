describe("chorus.dialogs.DatasetImport", function() {
    beforeEach(function() {
        chorus.page = {};
        chorus.page.workspace = newFixtures.workspace({id: 242});
        this.modalSpy = stubModals();
        spyOn($.fn, 'fileupload');
        this.launchElement = $('<button data-workspace-id="242">Import File</button>');
        this.launchElement.data("canonicalName", "FooBar");
        this.validDatasets = [
            newFixtures.datasetSandboxTable({objectName: "table_a", workspace: {id: 242}}),
            newFixtures.datasetSandboxTable({objectName: "table_b", workspace: {id: 243}})
        ];
        this.invalidDatasets = [
            newFixtures.datasetExternalTable(),
            newFixtures.datasetSandboxView(),
            fixtures.datasetHadoopExternalTable()
        ];
        this.datasets = this.validDatasets.concat(this.invalidDatasets);
        this.dialog = new chorus.dialogs.DatasetImport({launchElement: this.launchElement});
        spyOn(this.dialog, "modalClosed").andCallThrough();
        this.dialog.launchModal();
    });

    it("has a file picker", function() {
        expect(this.dialog.$("input[type=file]")).toExist();
        expect(this.dialog.$(".file-wrapper button")).not.toHaveClass("hidden");
        expect(this.dialog.$(".file-wrapper button").text()).toMatchTranslation("dataset.import.select_file");
    });

    it("has the right title", function() {
        expect(this.dialog.$(".dialog_header h1").text()).toMatchTranslation("dataset.import.title");
    });

    it("has text describing where the file should be imported", function() {
        expect(this.dialog.$(".where")).toContainTranslation("dataset.import.where", {canonicalName: "FooBar"});
    });

    it("has a 'Cancel' button", function() {
        expect(this.dialog.$("button.cancel").text()).toMatchTranslation("actions.cancel");
    });

    it("has an 'Upload File' button", function() {
        expect(this.dialog.$("button.submit").text()).toMatchTranslation("dataset.import.upload_file");
    });

    it("has a 'Change' link", function() {
        expect(this.dialog.$(".file-wrapper a").text()).toMatchTranslation("actions.change");
    });

    it("disables the 'Upload File' button by default", function() {
        expect(this.dialog.$("button.submit")).toBeDisabled();
    });

    it("displays 'No File Chosen' by default", function() {
        expect(this.dialog.$(".empty_selection").text()).toMatchTranslation("dataset.import.no_file_selected");
    });

    it("hides the import controls by default", function() {
        expect(this.dialog.$(".import_controls")).toHaveClass("hidden")
    });

    it("hides the file type img by default", function() {
        expect(this.dialog.$(".file_details img")).toHaveClass("hidden")
    });

    it("hides the 'Change' link by default", function() {
        expect(this.dialog.$(".file-wrapper a")).toHaveClass("hidden");
    });

    context("when a file is chosen", function() {
        beforeEach(function() {
            this.fileList = [
                {
                    name: 'foo Bar Baz.csv'
                }
            ];
            expect($.fn.fileupload).toHaveBeenCalled();
            this.fileUploadOptions = $.fn.fileupload.mostRecentCall.args[0];
            this.request = jasmine.createSpyObj('request', ['abort']);
            this.fileUploadOptions.add(null, {files: this.fileList, submit: jasmine.createSpy().andReturn(this.request)});
        });

        describe("default settings", function() {

            it("enables the upload button", function() {
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });

            it("displays the chosen filename", function() {
                expect(this.dialog.$(".file_name").text()).toBe("foo Bar Baz.csv");
            });

            it("displays the appropriate file icon", function() {
                expect(this.dialog.$(".file_details img")).not.toHaveClass("hidden")
                expect(this.dialog.$(".file_details img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("csv", "medium"));
            });

            it("should hide the 'No file Selected' text", function() {
                expect(this.dialog.$(".empty_selection")).toHaveClass("hidden");
            });

            it("shows the 'Change' link", function() {
                expect(this.dialog.$(".file-wrapper a")).not.toHaveClass("hidden");
            });
        });

        describe("import controls", function() {
            it("does not hide them", function() {
                expect(this.dialog.$(".import_controls")).not.toHaveClass("hidden")
            })

            it("shows the 'import into a new table' radio button", function() {
                expect(this.dialog.$(".new_table input:radio")).toExist();
                expect(this.dialog.$(".new_table label").text()).toMatchTranslation("dataset.import.new_table");
            });

            it("shows the 'import into an existing table' radio button", function() {
                expect(this.dialog.$(".existing_table input:radio")).toExist();
                expect(this.dialog.$(".existing_table label[for='existing']").text()).toMatchTranslation("dataset.import.existing_table");
            });

            it("shows the 'upload as workfile' radio button", function() {
                expect(this.dialog.$(".workfile input:radio")).toExist();
                expect(this.dialog.$(".workfile label").text()).toMatchTranslation("dataset.import.workfile");
            });

            it("shows the file name entry", function() {
                expect(this.dialog.$(".new_table input:text")).toExist();
                expect(this.dialog.$(".new_table input:text").val()).toBe('foo_bar_baz');
            });

            it("sets the title text of the file input field", function() {
                expect(this.dialog.$("input[type=file]").prop("title")).toMatchTranslation("dataset.import.change_file");
            });

            describe("the default selection", function() {
                it("selects the new table button by default", function() {
                    expect(this.dialog.$(".new_table input:radio").prop("checked")).toBeTruthy()
                });

                it("shows the file name entry, in lowercase, with spaces converted to underscores", function() {
                    expect(this.dialog.$(".new_table input:text")).toBeEnabled();
                    expect(this.dialog.$(".new_table input:text").val()).toBe("foo_bar_baz");
                });

                it("enables the table name input", function() {
                    expect(this.dialog.$(".new_table input")).toBeEnabled();
                });

                it("doesn't show the span or link for selecting a dataset", function() {
                    expect(this.dialog.$(".existing_table a.dataset_picked")).toHaveClass("hidden");
                    expect(this.dialog.$(".existing_table span.dataset_picked")).toHaveClass("hidden");
                });
            });

            describe("selecting 'Import into existing table'", function() {
                beforeEach(function() {
                    this.dialog.$(".existing_table input:radio").prop('checked', true).change();
                });

                it("disables the upload button", function() {
                    expect(this.dialog.$("button.submit")).toBeDisabled();
                });

                it("shows the truncate check box", function() {
                    expect(this.dialog.$(".existing_table .options")).not.toHaveClass("hidden");
                    expect(this.dialog.$(".existing_table #truncate")).toBeEnabled();
                });

                it("should enable the dataset selection link", function() {
                    expect(this.dialog.$(".existing_table a.dataset_picked")).not.toHaveClass("hidden");
                    expect(this.dialog.$(".existing_table span.dataset_picked")).toHaveClass("hidden");
                });

                context("when clicking the dataset picker link", function() {
                    beforeEach(function() {
                        this.dialog.$(".existing_table a.dataset_picked").click();
                    });

                    it("should have a link to the dataset picker dialog", function() {
                        expect(this.dialog.$(".existing_table a.dataset_picked")).toContainTranslation("dataset.import.select_dataset");
                    });

                    it("should launch the dataset picker dialog", function() {
                        expect(this.modalSpy.lastModal()).toBeA(chorus.dialogs.ImportDatasetsPicker);
                    });

                    context("when no dataset is selected", function() {
                        context("when 'import into new table' is checked", function() {
                            beforeEach(function() {
                                this.dialog.$("input[id='new_table']").prop("checked", true).change();
                            });

                            it("doesn't show the span or link for selecting a dataset", function() {
                                expect(this.dialog.$(".existing_table a.dataset_picked")).toHaveClass("hidden");
                                expect(this.dialog.$(".existing_table span.dataset_picked")).toHaveClass("hidden");
                            });

                            it("enables the upload button", function() {
                                expect(this.dialog.$("button.submit")).toBeEnabled();
                            });
                        });
                    });

                    context("when a dataset is selected", function() {
                        beforeEach(function() {
                            this.datasets = [newFixtures.datasetSourceTable({ objectName: "myDataset" })];
                            chorus.modal.trigger("datasets:selected", this.datasets);
                        });

                        it("it should show the selected dataset in the link", function() {
                            expect(this.dialog.$(".existing_table a.dataset_picked")).toContainText("myDataset");
                        });

                        it("enables the upload button", function() {
                            expect(this.dialog.$("button.submit")).toBeEnabled();
                        });

                        context("and then 'import into new table' is checked", function() {
                            beforeEach(function() {
                                this.dialog.$("input[id='new_table']").prop("checked", true).change();
                            });

                            it("should hide the select a dataset link", function() {
                                expect(this.dialog.$(".existing_table a.dataset_picked")).toHaveClass("hidden");
                            });

                            it("should show the selected table name in the existing table section", function() {
                                expect(this.dialog.$(".existing_table span.dataset_picked")).not.toHaveClass('hidden');
                            });

                            it("disables the truncate checkbox", function() {
                                expect(this.dialog.$(".existing_table .options input")).toBeDisabled();
                            });

                            it("hides the truncate option", function() {
                                expect(this.dialog.$(".existing_table .options")).toHaveClass("hidden");
                            });
                        });
                    });
                });
            });

            describe("selecting 'Upload as a work file'", function() {
                beforeEach(function() {
                    this.dialog.$(".new_table input:radio").removeAttr('checked').change();
                    this.dialog.$(".workfile input:radio").attr('checked', 'checked').change();
                });

                it("should enable the upload button", function() {
                    expect(this.dialog.$('button.submit')).toBeEnabled();
                });

                context("clicking the upload button", function() {
                    beforeEach(function() {
                        this.dialog.$("button.submit").click();
                    });

                    context("when upload succeeds", function() {
                        beforeEach(function() {
                            spyOn(chorus.router, "navigate");
                            spyOn(chorus, "toast");
                            this.workfile = fixtures.workfile({id: "23", fileName: "myFile"});
                            this.data = {result: {
                                resource: [this.workfile.attributes],
                                status: "ok"
                            }};
                        });

                        context("and the workfile is showable", function() {
                            beforeEach(function() {
                                this.fileUploadOptions.done(null, this.data)
                            });
                            it("presents a toast message", function() {
                                expect(chorus.toast).toHaveBeenCalledWith("dataset.import.workfile_success", {fileName: "myFile"});
                            });

                            it("navigates to the new workfile page", function() {
                                expect(chorus.router.navigate).toHaveBeenCalledWith(this.workfile.showUrl());
                            });
                        });

                        context("and the workfile is not showable", function() {
                            beforeEach(function() {
                                spyOn(chorus.models.Workfile.prototype, "hasOwnPage").andReturn(false);
                                this.fileUploadOptions.done(null, this.data)
                            });

                            it("presents a toast message", function() {
                                expect(chorus.toast).toHaveBeenCalledWith("dataset.import.workfile_success", {fileName: "myFile"});
                            });

                            it("navigates to the workfile list page", function() {
                                expect(chorus.router.navigate).toHaveBeenCalledWith(this.workfile.workfilesUrl());
                            });
                        });
                    });
                    context("when upload fails", function() {
                        beforeEach(function() {
                            spyOn(chorus.router, "navigate");
                            spyOn(chorus, "toast");
                            this.workfile = fixtures.workfile({id: "23", fileName: "myFile"});
                            this.data = {
                                result: {
                                    resource: [],
                                    status: "fail",
                                    message: [
                                        {message: "Bad File"}
                                    ]
                                }
                            };
                            this.fileUploadOptions.done(null, this.data)

                        });

                        it("does not present a toast message", function() {
                            expect(chorus.toast).not.toHaveBeenCalled();
                        });

                        it("displays the errors", function() {
                            expect(this.dialog.$('.errors')).toContainText('Bad File');
                        })

                    });

                })
            })
        });

        describe("clicking 'Upload File'", function() {

            context("when all fields are valid", function() {
                beforeEach(function() {
                    this.dialog.$("form").submit();
                });

                it("should display a loading spinner", function() {
                    expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.uploading");
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                });

                it("uploads the specified file", function() {
                    expect(this.dialog.uploadObj.url).toEqual("/edc/workspace/242/csv/sample")
                    expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
                });

                context("when upload succeeds", function() {
                    beforeEach(function() {
                        spyOn(chorus.dialogs.NewTableImportCSV.prototype, "setup").andCallThrough()
                        spyOn(chorus.alerts.EmptyCSV.prototype, "setup").andCallThrough();
                    });

                    context("when the csv contains column data", function() {
                        beforeEach(function() {
                            this.data = {result: {
                                resource: [fixtures.csvImport({lines: ["col1,col2,col3", "val1,val2,val3"]}).attributes],
                                status: "ok"
                            }};
                            this.fileUploadOptions.done(null, this.data)
                        });

                        it("stops the spinner", function() {
                            expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                        });

                        it("does not modify the existing CSV (so that if someone cancels back to this modal, old data doesn't bleed through to future versions of import)", function() {
                            expect(this.dialog.csv.has('lines')).toBeFalsy();
                        });

                        it("launches the import new table dialog", function() {
                            expect(chorus.dialogs.NewTableImportCSV.prototype.setup).toHaveBeenCalled();

                            var dialogArgs = chorus.dialogs.NewTableImportCSV.prototype.setup.mostRecentCall.args[0]
                            expect(dialogArgs.csv.get("lines").length).toBe(2);

                            expect(this.modalSpy).toHaveModal(chorus.dialogs.NewTableImportCSV);
                        });

                        it("closes itself when the 'import new table' dialog closes", function() {
                            var importCsvDialog = chorus.dialogs.NewTableImportCSV.prototype.setup.mostRecentCall.object;
                            importCsvDialog.closeModal();
                            chorus.PageEvents.broadcast("csv_import:started");
                            expect(this.dialog.modalClosed).toHaveBeenCalled();
                        });

                        it("does not show an alert dialog", function() {
                            expect(chorus.alerts.EmptyCSV.prototype.setup).not.toHaveBeenCalled();
                            expect(this.modalSpy).not.toHaveModal(chorus.alerts.EmptyCSV);
                        })
                    });

                    context("when the csv contains no column data", function() {
                        beforeEach(function() {
                            this.data = {result: {
                                resource: [fixtures.csvImport({lines: []}).attributes],
                                status: "ok"
                            }};
                            this.fileUploadOptions.done(null, this.data)
                        });

                        it("stops the spinner", function() {
                            expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                        });

                        it("does not modify the dialog's CSV (to avoid weirdness when cancelling)", function() {
                            expect(this.dialog.csv.has('lines')).toBeFalsy();
                        });

                        it("does not launch the import new table dialog", function() {
                            expect(chorus.dialogs.NewTableImportCSV.prototype.setup).not.toHaveBeenCalled()
                            expect(this.modalSpy).not.toHaveModal(chorus.dialogs.NewTableImportCSV);
                        });

                        it("shows an alert dialog", function() {
                            expect(chorus.alerts.EmptyCSV.prototype.setup).toHaveBeenCalled();
                            expect(this.modalSpy).toHaveModal(chorus.alerts.EmptyCSV);
                        })
                    });

                    context("when the csv contains unparseable data", function() {
                        beforeEach(function() {
                            this.data = {result: {
                                resource: [fixtures.csvImport({lines: ['"foo,"bar"']}).attributes],
                                status: "ok"
                            }};
                            this.fileUploadOptions.done(null, this.data)
                        });

                        it("still launches the import new table dialog", function() {
                            expect(chorus.dialogs.NewTableImportCSV.prototype.setup).toHaveBeenCalled()
                            expect(this.modalSpy).toHaveModal(chorus.dialogs.NewTableImportCSV);
                        });
                    });
                });

                context("when the user tries to close the dialog", function() {
                    beforeEach(function() {
                        $(document).trigger("close.facebox");
                    })
                    it("cancels the upload", function() {
                        expect(this.dialog.request.abort).toHaveBeenCalled();
                    })

                    it("closes the dialog", function() {
                        expect(this.dialog.modalClosed).toHaveBeenCalled();
                    });
                })

                context("when the upload fails", function() {
                    beforeEach(function() {
                        this.data = {
                            result: {
                                resource: [],
                                message: [
                                    {message: "You failed"}
                                ],
                                status: "fail"
                            },
                            files: [
                                {name: "myfile"}
                            ]
                        };
                        this.fileUploadOptions.done(null, this.data)
                    });

                    it("does not launch the new table configuration dialog", function() {
                        expect(this.modalSpy).not.toHaveModal(chorus.dialogs.NewTableImportCSV);
                    });

                    it("fills the error field", function() {
                        expect(this.dialog.$(".errors ul")).toHaveText("You failed");
                    });

                    it("does not hide the import controls or change file link", function() {
                        expect(this.dialog.$(".import_controls")).not.toHaveClass("hidden");
                        expect(this.dialog.$(".file-wrapper a")).not.toHaveClass("hidden");
                        expect(this.dialog.$(".file-wrapper button")).toHaveClass("hidden");
                    });
                });
            });

            context("when importing into an existing table", function() {
                beforeEach(function() {
                    this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                    this.dialog.datasetsChosen([this.validDatasets[1]]);
                    this.dialog.$("form").submit();
                });

                it("sets the destination table and truncate options in the csv", function() {
                    expect(this.dialog.csv.get("toTable")).toBe(this.validDatasets[1].name());
                    expect(this.dialog.csv.get("truncate")).toBeFalsy();
                });
            });
        });
    });
});
