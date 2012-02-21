describe("chorus.dialogs.DatasetImport", function() {
    beforeEach(function() {
        chorus.page = {};
        chorus.page.workspace = fixtures.workspace({id:242});
        this.modalSpy = stubModals();
        spyOn($.fn, 'fileupload');
        this.launchElement = $('<button data-workspaceid=​242>​Import File​</button>​');
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
                expect(this.dialog.$(".existing_table label").text()).toMatchTranslation("dataset.import.existing_table");
            });

            it("shows the 'upload as workfile' radio button", function() {
                expect(this.dialog.$(".workfile input:radio")).toExist();
                expect(this.dialog.$(".workfile label").text()).toMatchTranslation("dataset.import.workfile");
            });

            it("shows the file name entry", function() {
                expect(this.dialog.$(".new_table input:text")).toExist();
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

            describe("selecting 'Import into existing table'", function() {
                beforeEach(function() {
                    this.dialog.$(".existing_table input:radio").change();
                });

                it("enables the table name selector", function() {
                    expect(this.dialog.$(".existing_table select")).toBeEnabled();
                });

                it("disables the table name input", function() {
                    expect(this.dialog.$(".new_table input")).toBeDisabled();
                });

                describe("and then selecting 'Import into new table", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").change();
                    });

                    it("enables the table name input", function() {
                        expect(this.dialog.$(".new_table input")).toBeEnabled();
                    });

                    it("disables the table name selector", function() {
                        expect(this.dialog.$(".existing_table select")).toBeDisabled();
                    });
                });
            });
        });

        describe("clicking 'Upload File'", function() {
            beforeEach(function() {
                this.dialog.$("form").submit();
            });

            it("should display a loading spinner", function() {
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.uploading");
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            });

            it("uploads the specified file", function() {
                expect(this.dialog.uploadObj.url).toEqual("/edc/workspace/​242/csv/sample")
                expect(this.dialog.uploadObj.submit).toHaveBeenCalled();
            });

            context("when upload succeeds", function() {
                beforeEach(function() {
                    this.data = {result: {
                        resource: [fixtures.csvImport({lines: ["col1,col2,col3", "val1,val2,val3"]}).attributes],
                        status: "ok"
                    }};
                    spyOn(chorus.dialogs.TableImportCSV.prototype, "setup").andCallThrough()
                    this.fileUploadOptions.done(null, this.data)
                });

                it("stops the spinner", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                });

                it("makes a CSV", function() {
                    expect(this.dialog.csv.get('lines').length).toBe(2);
                });

                it("launches the import new table dialog", function() {
                    expect(chorus.dialogs.TableImportCSV.prototype.setup).toHaveBeenCalledWith({csv: this.dialog.csv});
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.TableImportCSV);
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
        });
    });
});
