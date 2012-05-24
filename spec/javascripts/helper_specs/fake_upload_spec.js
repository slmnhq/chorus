describe("FakeFileUpload", function() {
    var form, input, fakeUpload;

    beforeEach(function() {
        form = $("<form/>");
        input = $("<input type='file'/>");
        form.append(input);

        fakeUpload = stubFileUpload(input);
    });

    it("spies on $.fn.fileupload", function() {
        expect($.fn.fileupload).not.toHaveBeenCalled();
    });

    describe("setting up the file upload", function() {
        var doneSpy, addSpy, failSpy;

        beforeEach(function() {
            doneSpy = jasmine.createSpy("done");
            addSpy  = jasmine.createSpy("add");
            failSpy = jasmine.createSpy("fail");

            input.fileupload({
                add: addSpy,
                done: doneSpy,
                fail: failSpy
            });
        });

        describe("#add(filenames) - simulating files being added", function() {
            beforeEach(function() {
                fakeUpload.add([ "file1.txt", "file2.txt", "file3.txt" ]);
            });

            it("calls the 'add' callback provided to the 'fileupload' method", function() {
                expect(addSpy).toHaveBeenCalled();
            });

            it("passes an object containing an array of file objects", function() {
                var data = addSpy.mostRecentCall.args[1];
                var fileList = data.files;
                expect(fileList.length).toBe(3);
                expect(fileList[0].name).toBe("file1.txt");
                expect(fileList[1].name).toBe("file2.txt");
                expect(fileList[2].name).toBe("file3.txt");
            });

            it("includes a 'submit' method", function() {
                var data = addSpy.mostRecentCall.args[1];
                expect(data.submit).toBeDefined();
            });

            describe("when the 'submit' method is called", function() {
                var request;

                beforeEach(function() {
                    var data = addSpy.mostRecentCall.args[1];
                    request = data.submit();
                });

                it("sets the 'wasSubmitted' flag", function() {
                    expect(fakeUpload.wasSubmitted).toBeTruthy();
                });

                it("returns a 'request' object with a 'abort' method", function() {
                    expect(request.abort).toBeDefined();
                });

                describe("#succeed(bodyJson) - simulating completion", function() {
                    beforeEach(function() {
                        fakeUpload.succeed({ response: { foo: "bar" } });
                    });

                    it("calls the 'done' callback", function() {
                        expect(doneSpy).toHaveBeenCalled();
                    });

                    it("passes the given data in a format mimicking the upload plugin", function() {
                        var data = doneSpy.mostRecentCall.args[1]
                        expect(data.result).toBe('{"response":{"foo":"bar"}}')
                    });
                });

                describe("#fail(bodyJson) - simulating failure", function() {
                    beforeEach(function() {
                        fakeUpload.fail( { errors: { fields:{ email: { BLANK: {} } } } } );
                    });

                    it("calls the 'fail' callback", function() {
                        expect(failSpy).toHaveBeenCalled();
                    });

                    it("passes a fake jquery event object", function() {
                        var event = failSpy.mostRecentCall.args[0];
                        expect(_.isFunction(event.preventDefault)).toBeTruthy();
                    });

                    it("passes an error in a format mimicking the upload plugin", function() {
                        var data = failSpy.mostRecentCall.args[1];
                        expect(data.jqXHR.responseText).toBe('{"errors":{"fields":{"email":{"BLANK":{}}}}}');
                    });
                });

                describe("when the upload is aborted", function() {
                    it("sets the 'wasAborted' flag", function() {
                        request.abort();
                        expect(fakeUpload.wasAborted).toBeTruthy();
                    });
                });
            });
        });
    });
});
