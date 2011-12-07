describe("chorus.views.ImageUpload", function() {
    beforeEach(function() {
        this.loadTemplate("image_upload");
        this.loadTemplate("errors")

        this.user = new chorus.models.User({ userName: "franklin", id : 13 });
        this.view = new chorus.views.ImageUpload({model : this.user});
        this.view.model.loaded = true;
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays an image with the model's imageUrl", function() {
            expect(this.view.$("img").attr("src")).toBe(this.user.imageUrl());
        });

        context("when a photo to upload has been chosen", function() {
            beforeEach(function() {
                this.fileList = [
                    {fileName: 'foo.png'}
                ];

                this.view.$("input[type=file]").fileupload('add', {files: this.fileList});
            });

            it("starts the upload", function() {
                expect(_.last(this.server.requests).method).toBe("POST");
                expect(_.last(this.server.requests).url).toContain(this.user.imageUrl({ size : 'original' }));
            });

            it("displays a spinner", function() {
                expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(1);
            });

            it("adds the disabled class to the image", function() {
                expect(this.view.$("img")).toHaveClass("disabled");
            });

            it("disables the upload button", function() {
                expect(this.view.$("input[type=file]").attr("disabled")).toBe("disabled");
                expect(this.view.$("a.action")).toHaveClass("disabled");
            });

            context("when the upload has finished successfully", function() {
                beforeEach(function() {
                    this.validatedSpy = jasmine.createSpy("validated");
                    this.user.bind("validated", this.validatedSpy);
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"status": "ok"}']);
                    this.server.respond();
                });

                it("removes the spinner", function() {
                    expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(0);
                });

                it("removes the disabled class from the image", function() {
                    expect(this.view.$("img")).not.toHaveClass("disabled");
                });

                it("changes/adds the cache-buster on the original image's URL", function() {
                    var originalUrl = this.view.model.imageUrl();
                    var newUrl = this.view.$("img").attr("src");

                    expect(newUrl).not.toBe(originalUrl);
                    expect(newUrl).toContain("buster=");
                });

                it("triggers 'validated' on the model", function() {
                    expect(this.validatedSpy).toHaveBeenCalled();
                });

                it("re-enables the upload button", function() {
                    expect(this.view.$("input[type=file]").attr("disabled")).toBeUndefined();
                    expect(this.view.$("a.action")).not.toHaveClass("disabled");
                });
            });

            context("when the upload gives a server error", function() {
                beforeEach(function() {
                    this.saveFailedSpy = jasmine.createSpy("saveFailed");
                    this.user.bind("saveFailed", this.saveFailedSpy);
                    this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"status": "fail", "message" :[{"message":"Fake error message."}]}']);
                    this.server.respond();
                });

                it("sets the server errors on the model", function() {
                    expect(this.user.serverErrors[0].message).toBe("Fake error message.");
                });

                it("triggers saveFailed on the model", function() {
                    expect(this.saveFailedSpy).toHaveBeenCalled();
                });

                it("removes the spinner", function() {
                    expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(0);
                });

                it("removes the disabled class from the image", function() {
                    expect(this.view.$("img")).not.toHaveClass("disabled");
                });

                it("re-enables the upload button", function() {
                    expect(this.view.$("input[type=file]").attr("disabled")).toBeUndefined();
                    expect(this.view.$("a.action")).not.toHaveClass("disabled");
                });

                context("when the user submits a good image after a bad image", function() {
                    beforeEach(function() {
                        this.originalUrl = this.view.$("img").attr("src");
                        this.fileList = [
                            {fileName: 'foo.png'}
                        ];
                        this.view.$("input[type=file]").fileupload('add', {files: this.fileList});
                        this.server.respondWith([200, {'Content-Type': 'text/plain'}, '{"status": "ok", "message" :[]}']);
                        this.server.respond();
                    });

                    it("clears the errors", function() {
                        expect(this.user.serverErrors.length).toBe(0);
                    });

                    it("renders the good image", function() {
                        var newUrl = this.view.$("img").attr("src");
                        expect(newUrl).not.toBe(this.originalUrl);
                    });
                });
            });
        });
    });
});

