describe("chorus.dialogs.DatasetImport", function() {
    beforeEach(function() {
        chorus.page = {};
        chorus.page.workspace = fixtures.workspace({id: 242});
        this.modalSpy = stubModals();
        spyOn($.fn, 'fileupload');
        this.launchElement = $('<button data-workspace-id="242">Import File</button>');
        this.launchElement.data("canonicalName", "FooBar");
        this.collection = [fixtures.datasetSandboxTable({workspace: {id: 242}}), fixtures.datasetSandboxTable({workspace: {id: 242}})];
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

            it("hides the file select button", function() {
                expect(this.dialog.$(".file-wrapper button")).toHaveClass("hidden");
            })

            it("shows the 'Change' link", function() {
                expect(this.dialog.$(".file-wrapper a")).not.toHaveClass("hidden");
            });
        })

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

            it("shows the table name select", function() {
                expect(this.dialog.$(".existing_table select")).toExist();
            });

            describe("the default selection", function() {
                it("selects the new table button by default", function() {
                    expect(this.dialog.$(".new_table input:radio").attr("checked")).toBeTruthy()
                });

                it("shows the file name entry, in lowercase, with spaces converted to underscores", function() {
                    expect(this.dialog.$(".new_table input:text")).toBeEnabled();
                    expect(this.dialog.$(".new_table input:text").val()).toBe("foo_bar_baz");
                });

                it("enables the table name input", function() {
                    expect(this.dialog.$(".new_table input")).toBeEnabled();
                });

                it("disables the table name selector", function() {
                    expect(this.dialog.$(".existing_table select")).toBeDisabled();
                });
            });

            it("should enable the upload file button when selecting existing table if table name is already selected", function() {
                this.server.completeFetchFor(this.dialog.sandboxTables, this.collection);
                this.selectedOption = this.dialog.$('option:eq(1)').val();
                this.dialog.$("select").val(this.selectedOption).change();

                this.dialog.$(".new_table input:radio").removeAttr('checked').change();
                this.dialog.$(".existing_table input:radio").attr('checked', 'checked').change();
                this.dialog.$("input:radio").val("existing");

                expect(this.dialog.$('button.submit')).toBeEnabled();
            });

            describe("selecting 'Import into existing table'", function() {
                beforeEach(function() {
                    this.dialog.$(".new_table input:radio").removeAttr('checked').change();
                    this.dialog.$(".existing_table input:radio").attr('checked', 'checked').change();
                    this.dialog.$("input:radio").val("existing");
                });

                it("shows the truncate check box", function() {
                    expect(this.dialog.$(".existing_table .options")).not.toHaveClass("hidden");
                    expect(this.dialog.$(".existing_table #truncate")).toBeEnabled();
                });

                context("when fetch datasetTable has not completed", function() {
                    it("displays the loading spinner", function() {
                        expect(this.dialog.$(".existing_table .spinner").isLoading()).toBeTruthy();
                    })

                    it("hides the select box", function() {
                        expect(this.dialog.$(".existing_table .select")).toHaveClass("hidden");
                    })
                })

                context("when fetch has been completed", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.dialog.sandboxTables, this.collection);
                    });

                    it("does not display loading spinner", function() {
                        expect(this.dialog.$(".existing_table .spinner").isLoading()).toBeFalsy();
                    });

                    it("shows the select box", function() {
                        expect(this.dialog.$(".existing_table .select")).not.toHaveClass("hidden");
                    });

                    it("enables the table name selector", function() {
                        expect(this.dialog.$(".existing_table select.right")).toBeEnabled();
                    });

                    it("disables the table name input", function() {
                        expect(this.dialog.$(".new_table input:text")).toBeDisabled();
                    });

                    it("disables the upload button", function() {
                        expect(this.dialog.$('button.submit')).toBeDisabled();
                    });

                    it("loads a list of sandbox tables into the table name selector", function() {
                        expect(this.dialog.$(".existing_table select option").length).toBe(this.collection.length + 1);

                        var view = this.dialog;
                        _.each(this.collection, function(model, index) {
                            var option = view.$(".existing_table select option:eq(" + ( index + 1 ) + ")");
                            expect(option).toContainText(model.get("objectName"));
                            expect(option).toHaveAttr("value", model.get("objectName"));
                        }, this);
                    });

                    context("selecting an existing table", function() {
                        beforeEach(function() {
                            this.selectedOption = this.dialog.$('option:eq(1)').val();
                            this.dialog.$("select").val(this.selectedOption).change();
                        });

                        it("should enable the upload file button", function() {
                            expect(this.dialog.$('button.submit')).toBeEnabled();
                        });

                        it("should disable the upload button if the 'select one' option is chosen", function() {
                            this.dialog.$("select").val('').change();
                            expect(this.dialog.$("button.submit")).toBeDisabled();
                        })

                         context("clicking 'Upload File'", function() {
                             beforeEach(function() {
                                 this.dialog.$("form").submit();
                             })

                             it("should send the name of the existing table as the toTable", function() {
                                expect(this.dialog.csv.get("toTable")).toBe(this.selectedOption);
                            });

                            context("when upload succeeds", function() {
                                beforeEach(function() {
                                    this.data = {result: {
                                        resource: [fixtures.csvImport({lines: ["col1,col2,col3", "val1,val2,val3"]}).attributes],
                                        status: "ok"
                                    }};
                                    spyOn(chorus.dialogs.ExistingTableImportCSV.prototype, "setup").andCallThrough()
                                    this.fileUploadOptions.done(null, this.data)
                                });

                                it("launches the import to existing table dialog", function() {
                                    expect(chorus.dialogs.ExistingTableImportCSV.prototype.setup).toHaveBeenCalledWith({csv: this.dialog.csv});
                                    expect(this.modalSpy).toHaveModal(chorus.dialogs.ExistingTableImportCSV);
                                });
                            });
                        });

                    })

                    describe("and then selecting 'Import into new table", function() {
                        beforeEach(function() {
                            this.dialog.$("input:radio").val("new")
                            this.dialog.$(".new_table input:radio").attr("checked", "checked").change();
                        });

                        it("enables the table name input", function() {
                            expect(this.dialog.$(".new_table input")).toBeEnabled();
                        });

                        it("disables the table name selector", function() {
                            expect(this.dialog.$(".existing_table select")).toBeDisabled();
                        });

                        it("disables the truncate checkbox", function() {
                            expect(this.dialog.$(".existing_table .options input")).toBeDisabled();
                        });

                        it("hides the truncate option", function() {
                            expect(this.dialog.$(".existing_table .options")).toHaveClass("hidden");
                        });
                    });

                })
            });
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
                        this.data = {result: {
                            resource: [fixtures.csvImport({lines: ["col1,col2,col3", "val1,val2,val3"]}).attributes],
                            status: "ok"
                        }};
                        spyOn(chorus.dialogs.NewTableImportCSV.prototype, "setup").andCallThrough()
                        this.fileUploadOptions.done(null, this.data)
                    });

                    it("stops the spinner", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    });

                    it("sets the lines in the CSV", function() {
                        expect(this.dialog.csv.get('lines').length).toBe(2);
                    });

                    it("launches the import new table dialog", function() {
                        expect(chorus.dialogs.NewTableImportCSV.prototype.setup).toHaveBeenCalledWith({csv: this.dialog.csv});
                        expect(this.modalSpy).toHaveModal(chorus.dialogs.NewTableImportCSV);
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
                        this.data = {result: {
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
                        spyOn(chorus.dialogs.NewTableImportCSV.prototype, "setup").andCallThrough()
                        this.fileUploadOptions.done(null, this.data)
                    });
                    it("does not launch the new table configuration dialog", function() {
                        expect(this.modalSpy).not.toHaveModal(chorus.dialogs.NewTableImportCSV);
                    });
                    it("fills the error field", function() {
                        expect(this.dialog.$(".errors ul")).toHaveText("You failed");
                    })
                    it("does not hide the import controls or change file link", function() {
                        expect(this.dialog.$(".import_controls")).not.toHaveClass("hidden");
                        expect(this.dialog.$(".file-wrapper a")).not.toHaveClass("hidden");
                        expect(this.dialog.$(".file-wrapper button")).toHaveClass("hidden");
                    })
                })
            });
        });
    });
});
