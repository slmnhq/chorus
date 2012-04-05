describe("chorus.models.Comment", function() {
    beforeEach(function() {
        this.model = fixtures.noteComment({
            id: '41',
            author: {
                id: "45",
                firstName: "LeBron",
                lastName: "James"
            }
        });
    });

    describe("#urlTemplate", function() {
        it("correctly encodes the url", function() {
            this.model.set({entityType: "foo", entityId: "a/b/c"});
            expect(this.model.url()).toContain("/edc/comment/foo/a%2Fb%2Fc/41");
        });

        it("correctly encodes the url of new comments", function() {
            this.model.set({id: null, entityType: "foo", entityId: "%bar"});
            expect(this.model.url()).toContain("/edc/comment/foo/%25bar");
        });

        it("has the right url if it is a file", function() {
            this.model.set({entityType: "foo", entityId: "a/b/c"});
            expect(this.model.url({isFile: true})).toContain("/edc/comment/foo/a%2Fb%2Fc/41/file");
        });
    });

    describe("validation", function() {
        it("should return a falsyy value if there is no body", function() {
            this.model.set({ body : "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a body", function() {
            this.model.set({ body : "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });
    });

    describe("#note", function() {
        it("should return true for a note", function() {
            this.model.set({type: "NOTE"});
            expect(this.model.note()).toBeTruthy();
        });

        it("should return false for everything else", function() {
            this.model.set({type: "SUB_COMMENT"});
            expect(this.model.note()).toBeFalsy();
        });

        it("should return false when undefined", function() {
            this.model.unset("type");
            expect(this.model.note()).toBeFalsy();
        });
    });

    describe("#author", function() {
        beforeEach(function() {
            this.author = this.model.author();
        });

        it("returns a user with the right name", function() {
            expect(this.author.get("firstName")).toBe("LeBron");
            expect(this.author.get("lastName")).toBe("James");
        });

        it("memoizes", function() {
            expect(this.author).toBe(this.model.author());
        });
    });

    describe("saving the workfile attachments", function() {
        it("assigns the 'workfileIds' field as a comma-separated list of workfile ids", function() {
            this.model.workfiles = new chorus.collections.WorkfileSet([
                new chorus.models.Workfile({ id: 44 }),
                new chorus.models.Workfile({ id: 45 }),
                new chorus.models.Workfile({ id: 46 })
            ]);

            this.model.save();

            expect(this.model.get("workfileIds")).toBe("44,45,46");
        });
    });

    describe("saving the dataset attachments", function() {
        it("assigns the 'datasetIds' field as a comma-separated list of dataset ids", function() {
            this.model.datasets = new chorus.collections.DatasetSet([
                fixtures.datasetSandboxTable({ objectName: "table_a", id: 'a'}),
                fixtures.datasetSandboxTable({ objectName: "table_b", id: 'b'}),
                fixtures.datasetSandboxTable({ objectName: "table_c", id: 'c'})
            ]);

            this.model.save();

            expect(this.model.get("datasetIds")).toBe("a,b,c");
        });
    });

    describe("file upload handling", function() {
        beforeEach(function() {
            this.submitObject1 = createSubmitSpy();
            this.submitObject2 = createSubmitSpy();
            this.fileUpload1 = new chorus.models.CommentFileUpload({submit: this.submitObject1});
            this.fileUpload2 = new chorus.models.CommentFileUpload({submit: this.submitObject2});
            this.model.addFileUpload(this.fileUpload1);
            expect(this.model.files.length).toBe(1);
        })

        describe("removeFileUpload", function() {
            beforeEach(function() {
                this.fileUpload = new chorus.models.CommentFileUpload({});
                this.model.removeFileUpload(this.fileUpload1);
            });

            it("removes the object from the list of files", function() {
                expect(this.model.files.length).toBe(0);
            })
        });

        describe("addFileUpload", function() {
            beforeEach(function() {
                this.model.addFileUpload(this.fileUpload2);
            })

            it("adds the object from the list of files", function() {
                expect(this.model.files.length).toBe(2);
            })
        })

        describe("saveFiles", function() {
            beforeEach(function() {
                this.model.addFileUpload(this.fileUpload2);
                this.fileUploadSuccessSpy = jasmine.createSpy('fileUploadSuccess');
                this.fileUploadFailedSpy = jasmine.createSpy('fileUploadFailed');
                this.fileUploadDoneSpy = jasmine.createSpy('fileUploadDone');
                this.model.bind('fileUploadSuccess', this.fileUploadSuccessSpy);
                this.model.bind('fileUploadFailed', this.fileUploadFailedSpy);
                this.model.bind('fileUploadDone', this.fileUploadDoneSpy);
                this.model.saveFiles();
            });

            it("calls submit on each file", function() {
                expect(this.fileUpload1.data.submit).toHaveBeenCalled();
                expect(this.fileUpload2.data.submit).toHaveBeenCalled();
            });

            describe("when a cache-busting query param is included", function() {
                beforeEach(function() {
                    this.model.urlParams = { iebuster: "123" };
                    this.model.saveFiles();
                });

                it("sets the url of each upload", function() {
                    expect(this.fileUpload1.data.url).toMatchUrl('/edc/comment/instance/1/41/file?iebuster=123');
                    expect(this.fileUpload2.data.url).toMatchUrl('/edc/comment/instance/1/41/file?iebuster=123');
                });
            });


            describe("when all saves succeed", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.mostRecentCall.args[0]();
                    this.submitObject2.promise.done.mostRecentCall.args[0]();
                })

                it("triggers fileUploadSuccess", function() {
                    expect(this.fileUploadSuccessSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadSuccessSpy.callCount).toBe(1);
                })

                it("triggers fileUploadDone", function() {
                    expect(this.fileUploadDoneSpy).toHaveBeenCalled();
                })
            });

            describe("when some of the saves have api failure", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.mostRecentCall.args[0]();
                    this.submitObject2.promise.done.mostRecentCall.args[0](
                        {
                            message: [
                                {
                                    message: "The field fileToUpload[] exceeds its maximum permitted  size of 10485760 bytes."
                                }
                            ],
                            resource: [],
                            status: "fail"
                        }
                    );
                });
                it("triggers fileUploadFailed", function() {
                    expect(this.fileUploadSuccessSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy.callCount).toBe(1);
                });

                it("triggers fileUploadDone", function() {
                    expect(this.fileUploadDoneSpy).toHaveBeenCalled();
                })

                it("puts the error on the file object", function() {
                    expect(this.fileUpload2.serverErrors).toEqual([{message:'The field fileToUpload[] exceeds its maximum permitted  size of 10485760 bytes.'}]);
                });

                it("copies the errors to the model", function() {
                    expect(this.model.serverErrors).toEqual([{message:'The field fileToUpload[] exceeds its maximum permitted  size of 10485760 bytes.'}]);
                });
            });

            describe("when some of the saves have failed", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.mostRecentCall.args[0]();
                    this.submitObject2.promise.fail.mostRecentCall.args[0]();
                })

                it("triggers fileUploadFailed", function() {
                    expect(this.fileUploadSuccessSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy.callCount).toBe(1);

                })
            })

            describe("when the file upload is cancelled", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.mostRecentCall.args[0]();
                    this.submitObject2.promise.fail.mostRecentCall.args[0]({}, 'abort');
                })

                it("sets serverErrors on the model", function() {
                    expect(this.model.serverErrors[0].message).toMatchTranslation('notes.new_dialog.upload_cancelled');
                })
            })

            describe("when both uploads are cancelled", function() {
                beforeEach(function() {
                    this.submitObject1.promise.fail.mostRecentCall.args[0]({}, 'abort');
                    this.submitObject2.promise.fail.mostRecentCall.args[0]({}, 'abort');
                })

                it("only has the cancel message once", function() {
                    expect(this.model.serverErrors.length).toBe(1);
                })
            })
        });
    })

    function createSubmitSpy() {
        var fakePromise = jasmine.createSpyObj('submitResult', ['done', 'fail']);
        fakePromise.done.andReturn(fakePromise);
        fakePromise.fail.andReturn(fakePromise);

        var spy = jasmine.createSpy('submit').andReturn(fakePromise);
        spy.promise = fakePromise;
        return spy;
    }
});
