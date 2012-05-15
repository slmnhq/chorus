describe("chorus.dialogs.CreateDirectoryExternalTableFromHdfs", function() {
    beforeEach(function() {

        this.collection = fixtures.csvHdfsFileSet().filesOnly();
        this.csv = new chorus.models.CsvHdfs({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
            instance: {id : "234"},
            path: "/foo/bar.txt",
            name: "bar"
        });

        this.collection.at(0).set(this.csv);
        this.dialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            workspaceId: "22",
            directoryName: "test",
            collection: this.collection
        });
    });

    describe("#setup", function() {
        it("sets csv to be the first models in the collection", function() {
            expect(this.dialog.csv).toEqual(this.collection.at(0))
        });
    });

    describe("#setupCsv", function () {
        context("when the directory path is /", function() {
            beforeEach(function() {
                this.dialog.collection.attributes.path = "/";
                this.dialog.setupCsv();
            });
            it("prevents an extra / from being included in the file path", function() {
                expect(this.dialog.csv.get("path")).toBe("/bar");
            });

        });

        it("sets the toTable, instanceId and file path to the model", function() {
            expect(this.dialog.csv.get("toTable")).toBe("test");
            expect(this.dialog.csv.get("instanceId")).toBe("234");
            expect(this.dialog.csv.get("path")).toBe("/data/bar");
        });
    });

    describe("#render", function () {
        beforeEach(function() {
            this.dialog.render();
        });

        it("populates the table name with the directory name", function() {
            expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
        });

        it("populates the select sample file with hdfs text files", function() {
            expect(this.dialog.$("select option").length).toBe(3);
        })

        it("selects the all files option by default", function() {
            expect(this.dialog.$('input:radio[name=pathType]:checked').val()).toBe("directory");
        });

        it("creates a textbox for the file expression", function() {
            expect(this.dialog.$("[name=expression]")).toExist();
        });

        describe("changing the file", function () {
            beforeEach(function() {
                var selElement = this.dialog.$("select").val(this.collection.at(1).get("name"))
                selElement.change();
            });
            it("should fetch the new sample", function() {
                expect(this.server.lastFetch().url).toBe("/edc/data/"+this.collection.at(1).get("instanceId")+"/hdfs/"+
                    encodeURIComponent(this.collection.at(1).get("path")) + "/sample")
            });
            it("display spinner", function() {
                expect(this.dialog.$(".data_table").isLoading()).toBeTruthy();

            })
            context("when the fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.dialog.csv, this.csv);
                });

                it("stops the spinner", function() {
                    expect(this.dialog.$(".data_table").isLoading()).toBeFalsy();
                });
                it("display the correct toTable name", function() {
                    expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
                });
            });
        });

        context("clicking submit", function() {
            xcontext("with invalid values", function() {
                beforeEach(function() {
                    this.dialog.$(".directions input:text").val("");
                    this.dialog.$("button.submit").click();
                });

                it("marks the table name as having an error", function() {
                    expect(this.dialog.$(".directions input:text")).toHaveClass("has_error");
                });
            });

            context("with has header false", function() {
                beforeEach(function() {
                    this.dialog.$("#hasHeader").prop('checked', true).change();
                    this.dialog.$("input[name=toTable]").val("testisgreat").change();
                    this.dialog.$(".field_name input").eq(0).val("gobbledigook").change();
                    this.dialog.$("#hasHeader").prop('checked', false).change();
                    this.dialog.$('button.submit').click();
                });

                it("posts to the right URL", function() {
                    var request = this.server.lastCreate();
                    var statement = "testisgreat (column_1 text, column_2 text, column_3 text, column_4 text, column_5 text)";

                    expect(request.url).toMatchUrl("/edc/workspace/22/externaltable");
                    expect(request.params().statement).toBe(statement);
                    expect(request.params().hasHeader).toBe('false');
                });

                context("switch header to on again", function() {
                    beforeEach(function() {
                        this.dialog.$("#hasHeader").prop("checked", true).change();
                    })

                    it("retains column names when changing column names back and forth between generated and header", function() {
                        expect(this.dialog.$(".field_name input").eq(0).val()).toBe("gobbledigook");
                    })


                    it("retains the table name when changing column names back and forth between generated and header", function() {
                        expect(this.dialog.$("input[name=toTable]").val()).toBe("testisgreat");
                    })
                })
            });
            context("with has header true", function() {
                beforeEach(function() {
                    this.dialog.$("input#directory").attr('checked', 'checked');
                    this.dialog.$("#hasHeader").prop("checked", true).change();
                    this.dialog.$('button.submit').click();
                });

                it("starts the loading spinner", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                    expect(this.dialog.$("button.submit")).toContainTranslation("hdfs.create_external.creating")
                });

                it("posts to the right URL", function() {
                    var request = this.server.lastCreate();
                    var statement = "test (col1 text, col2 text, col3 text, col_4 text, col_5 text)";

                    expect(request.url).toMatchUrl("/edc/workspace/22/externaltable");
                    expect(request.params().path).toBe("/data/bar");
                    expect(request.params().instanceId).toBe("234");
                    expect(request.params().statement).toBe(statement);
                    expect(request.params().hasHeader).toBe('true');
                    expect(request.params().pathType).toBe('directory');
                });

                context("when the pathType is pattern", function() {
                    beforeEach(function() {
                        this.dialog.$("#hasHeader").prop("checked", true).change();

                        this.dialog.$("input#directory").removeAttr('checked');
                        this.dialog.$("input#pattern").attr('checked', 'checked').change();
                        this.dialog.$("input[name='expression']").val("*.js");
                        this.dialog.$('button.submit').click();
                    });

                    it("posts to the right URL", function() {
                        var request = this.server.lastCreate();

                        expect(request.url).toMatchUrl("/edc/workspace/22/externaltable");
                        expect(request.params().pathType).toBe('pattern');
                        expect(request.params().path).toBe("/data/*.js");
                    });
                })

                context("when the post to import responds with success", function() {
                    beforeEach(function() {
                        spyOn(this.dialog, "closeModal");
                        spyOn(chorus, 'toast');
                        spyOn(chorus.PageEvents, 'broadcast');
                        this.server.lastCreate().succeed();
                    });

                    it("closes the dialog and displays the right toast", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                        expect(chorus.toast).toHaveBeenCalledWith("hdfs.create_external.success", {tableName: this.dialog.$("input:text").eq(0).val()});
                    });

                    it("triggers csv_import:started", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("csv_import:started");
                    });
                })
            });

            context("retain entered values when clicking submit", function() {
                beforeEach(function() {
                    this.$type = this.dialog.$(".th .type").eq(1);
                    this.$type.find(".chosen").click();
                    this.$type.find(".popup_filter li").eq(3).find("a").click();
                    this.dialog.$("input[name=toTable]").val("testisgreat").change();
                    this.dialog.$(".field_name input").eq(0).val("gobbledigook").change();

                    this.dialog.$("button.submit").click();
                    this.server.lastCreate().fail([
                        { message: "I like cheese" }
                    ]);
                });

                it("has no validation errors", function() {
                    expect(this.dialog.$(".has_error").length).toBe(0)
                });

                it("retains column names", function() {
                    expect(this.dialog.$(".field_name input").eq(0).val()).toBe("gobbledigook");
                });

                it("retains the table name", function() {
                    expect(this.dialog.$("input[name=toTable]").val()).toBe("testisgreat");
                });

                it("retains the data types", function() {
                    this.$type = this.dialog.$(".th .type").eq(1);
                    expect(this.$type.find(".chosen")).toHaveText("date");
                    expect(this.$type).toHaveClass("date");
                });
            });
        });
    });

    describe("the help text tooltip", function() {
        beforeEach(function() {
            spyOn($.fn, 'qtip');
            this.dialog.render();
            this.qtipCall = $.fn.qtip.calls[0];
        });

        it("makes a tooltip for each help", function() {
            expect($.fn.qtip).toHaveBeenCalled();
            expect(this.qtipCall.object).toBe(".help");
        });

        it("renders a help text", function() {
            expect(this.qtipCall.args[0].content).toMatchTranslation("hdfs_instance.create_external.specify_expression_help_text");
        });
    });
});
