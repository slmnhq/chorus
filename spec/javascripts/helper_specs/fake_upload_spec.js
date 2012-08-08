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

    it("throws an exception if you try to use PUT, since IE doesn't do that", function() {
        expect(function() {
            input.fileupload({ type: "PUT" });
        }).toThrow();
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

            describe("when file sizes are given", function() {
                it("uses them", function() {
                    fakeUpload.add([{ name: "file1.txt", size: 4321, type: "malware/virus" }]);
                    var data = addSpy.mostRecentCall.args[1];
                    var fileList = data.files;
                    expect(fileList.length).toBe(1);
                    expect(fileList[0].name).toBe("file1.txt");
                    expect(fileList[0].size).toBe(4321);
                    expect(fileList[0].type).toBe("malware/virus");
                });
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

                describe("#HTTPResponseFail", function() {
                    beforeEach(function() {
                        fakeUpload.HTTPResponseFail("<html>Hello World</html>", 404, "Page could not be found at all");
                    });

                    it("calls the 'fail' callback", function() {
                        expect(failSpy).toHaveBeenCalled();
                    });

                    it("passes a fake jquery event object", function() {
                        var event = failSpy.mostRecentCall.args[0];
                        expect(_.isFunction(event.preventDefault)).toBeTruthy();
                    });

                    it("passes an error in a format mimicking nginx errors", function() {
                        var data = failSpy.mostRecentCall.args[1];
                        expect(data.jqXHR.responseText).toBe('<html>Hello World</html>');
                        expect(data.jqXHR.status).toBe(404);
                        expect(data.jqXHR.statusText).toBe('Page could not be found at all');
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
