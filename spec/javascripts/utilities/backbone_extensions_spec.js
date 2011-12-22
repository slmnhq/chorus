describe("backbone_extensions", function() {
    describe("sync", function() {
        beforeEach(function() {
            spyOn($, "ajax").andCallThrough();
            this.model = new chorus.models.Base();
            this.model.urlTemplate = "my_items/{{id}}";
        })

        context("with a non-file upload model", function() {
            describe("#save", function() {
                it("uses AJAX", function() {
                    this.model.save();
                    expect($.ajax).toHaveBeenCalled();
                })
            })
        })

        context("with a file upload model", function() {
            beforeEach(function() {
                this.uploadDeferred = new $.Deferred();
                this.uploadPromise = this.uploadDeferred.promise();

                var input = $("<input/>").attr("type", "file").data("fileupload", { options: {}});
                this.uploadSpy = {
                    submit: jasmine.createSpy("submit").andReturn(this.uploadPromise),
                    form: $("<form></form>").append(input)[0]
                };
                this.model.uploadObj = this.uploadSpy;
            });

            context("with a new object", function() {
                beforeEach(function() {
                    this.uploadedSpy = jasmine.createSpy();
                    this.uploadFailedSpy = jasmine.createSpy();
                    this.model.bind("uploaded", this.uploadedSpy);
                    this.model.bind("uploadFailed", this.uploadFailedSpy);
                    this.model.save({ name: "Enrique" });
                });

                it("does not use AJAX", function() {
                    expect($.ajax).not.toHaveBeenCalled();
                });

                it("submits the upload object", function() {
                    expect(this.uploadSpy.submit).toHaveBeenCalled();
                });
            });

            context("with an existing object", function() {
                beforeEach(function() {
                    this.model.set({id: '123'})
                    this.model.save();
                });

                it("uses AJAX", function() {
                    expect($.ajax).toHaveBeenCalled();
                });
            });
        });
    });
});
