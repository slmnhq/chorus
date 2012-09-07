describe("chorus.views.ImageUpload", function() {
    beforeEach(function() {
        this.user = rspecFixtures.user({
            username: "franklin",
            id : 13,
            image: { original: "/foo", icon: "/icon" }
        });
        this.view = new chorus.views.ImageUpload({model : this.user});
        this.view.model.loaded = true;
        this.imageJson = rspecFixtures.imageJson();
        this.server.completeFetchFor(chorus.models.Config.instance(), rspecFixtures.config());
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.addImageKey = "workspace.settings.image.add";
            this.view.changeImageKey = "workspace.settings.image.change";
            this.view.render();
        });

        context("when the image is not editable", function() {
            beforeEach(function() {
                this.view.editable = false;
                this.view.render();
            });

            it("does not display the change link", function() {
                expect(this.view.$("a.action")).not.toExist();
            });

            it("disables the file input", function() {
                expect(this.view.$("input[type=file]")).toBeDisabled();
            });
        });

        context("when the model does NOT have an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(false);
                this.view.render();
            });

            it("displays the link with the 'add image' text", function() {
                expect(this.view.$("a.action").text()).toMatchTranslation(this.view.addImageKey);
            });

            it("does assign a 'src' attribute to the image", function() {
                expect(this.view.$("img").attr('src')).toBeUndefined();
            })

            it("the image is hidden", function() {
                expect(this.view.$("img")).toHaveClass('hidden')
            })
        });

        context("when the model has an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(true);
                this.view.render();
            });

            it("displays the link with the 'change image' text", function() {
                expect(this.view.$("a.action").text()).toMatchTranslation(this.view.changeImageKey);
            });

            it("displays an image with the model's fetchImageUrl", function() {
                expect(this.view.$("img").attr("src")).toContain(this.user.fetchImageUrl());
            });

            it("the image is not hidden", function() {
                expect(this.view.$("img")).not.toHaveClass('hidden')
            });
        });

        context("when a photo to upload has been chosen", function() {
            context("when the file size within the limit", function () {
                beforeEach(function() {
                    this.fakeFileUpload = stubFileUpload();
                    this.view.render();
                    this.fakeFileUpload.add([ "foo.png" ]);
                });

                it("submits the upload immediately", function () {
                    expect(this.fakeFileUpload.wasSubmitted).toBeTruthy();
                });

                it("displays a spinner", function() {
                    expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(1);
                });

                it("adds the disabled class to the image", function() {
                    expect(this.view.$("img")).toHaveClass("disabled");
                });

                it("disables the upload button", function() {
                    expect(this.view.$("input[type=file]")).toBeDisabled();
                    expect(this.view.$("a.action")).toHaveClass("disabled");
                });

                it("uploads to the model's createImageUrl", function() {
                    expect(this.fakeFileUpload.options.url).toBe(this.user.createImageUrl());
                });

                context("when the upload has finished successfully", function() {
                    beforeEach(function() {
                        this.originalImgSrc = this.view.$("img").attr("src");
                        spyOn(chorus, "updateCachebuster").andCallThrough();

                        spyOnEvent(this.user, "validated");
                        spyOnEvent(this.user, "image:change");
                        spyOnEvent(this.user, "change");

                        this.fakeFileUpload.succeed(this.imageJson);
                    });

                    it("removes the spinner", function() {
                        expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(0);
                    });

                    it("removes the disabled class from the image", function() {
                        expect(this.view.$("img")).not.toHaveClass("disabled");
                    });

                    it("removes the hidden class from the image", function() {
                        expect(this.view.$("img")).not.toHaveClass('hidden')
                    });

                    it("updates the cachebuster", function() {
                        expect(chorus.updateCachebuster).toHaveBeenCalled();
                    });

                    it("changes/adds the cache-buster on the original image's URL", function() {
                        expect(this.view.$("img").attr("src")).not.toBe(this.originalImgSrc);
                    });

                    it("triggers 'validated' on the model", function() {
                        expect("validated").toHaveBeenTriggeredOn(this.user);
                    });

                    it("triggers 'image:change' on the model", function() {
                        expect("image:change").toHaveBeenTriggeredOn(this.user);
                    });

                    it("doesn't trigger change on the model", function() {
                        expect("change").not.toHaveBeenTriggeredOn(this.user);
                    });

                    it("sets the image urls in the model", function() {
                        expect(this.user.fetchImageUrl({ size: "original" })).toMatchUrl(this.imageJson.response.original, {
                            paramsToIgnore: "iebuster"
                        });
                        expect(this.user.fetchImageUrl({ size: "icon" })).toMatchUrl(this.imageJson.response.icon, {
                            paramsToIgnore: "iebuster"
                        });
                    });

                    it("re-enables the upload button", function() {
                        expect(this.view.$("input[type=file]")).not.toBeDisabled();
                        expect(this.view.$("a.action")).not.toHaveClass("disabled");
                    });
                });

                context("when the upload gives a server error", function() {
                    beforeEach(function() {
                        spyOnEvent(this.user, "saveFailed");
                        this.fakeFileUpload.fail({
                            errors: { fields: { a: { BLANK: {} } } }
                        });
                    });

                    it("sets the server errors on the model", function() {
                        expect(_.first(this.user.serverErrorMessages())).toBe("A can't be blank");
                    });

                    it("triggers saveFailed on the model", function() {
                        expect("saveFailed").toHaveBeenTriggeredOn(this.user);
                    });

                    it("removes the spinner", function() {
                        expect(this.view.$(".spinner_container div[aria-role=progressbar]").length).toBe(0);
                    });

                    it("removes the disabled class from the image", function() {
                        expect(this.view.$("img")).not.toHaveClass("disabled");
                    });

                    it("re-enables the upload button", function() {
                        expect(this.view.$("input[type=file]")).not.toBeDisabled();
                        expect(this.view.$("a.action")).not.toHaveClass("disabled");
                    });

                    context("when the user submits a good image after a bad image", function() {
                        beforeEach(function() {
                            this.originalUrl = '/users/1234/image';
                            this.view.$("img").attr("src", this.originalUrl);
                            this.fakeFileUpload.add([ "foo.png" ]);
                            this.fakeFileUpload.succeed(this.imageJson);
                        });

                        it("clears the errors", function() {
                            expect(this.user.serverErrors).not.toBeDefined();
                        });

                        it("renders the good image", function() {
                            var newUrl = this.view.$("img").attr("src");
                            expect(newUrl).not.toBe(this.originalUrl);
                        });
                    });
                });
            });

            context("when the file size exceed the limit", function () {
                beforeEach(function () {
                    this.fakeFileUpload = stubFileUpload();
                    this.view.render();
                    this.validationSpy = jasmine.createSpy("validationSpy");
                    this.user.bind("validationFailed", this.validationSpy, this);
                    this.fakeFileUpload.add([
                        { name:'foo Bar Baz.png', size:999999999999999999 }
                    ]);
                });

                it("shows an error", function () {
                    var maxFileSize = chorus.models.Config.instance().get("fileSizesMbUserIcon");
                    expect(this.user.serverErrors["fields"]["base"]["FILE_SIZE_EXCEEDED"]["count"]).toEqual(maxFileSize)
                });

                it("triggers validationFailed", function() {
                    expect(this.validationSpy).toHaveBeenCalled();
                });

                it("removes the error when a valid file is then selected", function () {
                    this.fakeFileUpload.add([
                        { name:'foo Bar Baz.png', size:9999 }
                    ]);
                    expect(this.user.serverErrors).toBeUndefined();
                });

                it("does not submit the upload", function () {
                    expect(this.fakeFileUpload.wasSubmitted).toBeFalsy();
                });

                it("re-enables uploading", function() {
                    expect(this.view.$(".spinner_container div[aria-role=progressbar]")).not.toExist();
                });
            });

        });
    });
});

