describe("backbone_extensions", function() {
    describe("sync", function() {
        beforeEach(function() {
            spyOn($, "ajax");
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
                this.uploadSpy = jasmine.createSpyObj("upload", ["submit"]);
                this.model.uploadObj = this.uploadSpy;
            })

            describe("#save", function() {
                context("with a new object", function() {
                    beforeEach(function() {
                        this.uploadedSpy = jasmine.createSpy();
                        this.uploadFailedSpy = jasmine.createSpy();
                        this.model.bind("uploaded", this.uploadedSpy);
                        this.model.bind("uploadFailed", this.uploadFailedSpy);
                        this.model.save();
                    })

                    it("does not use AJAX", function() {
                        expect($.ajax).not.toHaveBeenCalled();
                    })

                    it("submits the upload object", function() {
                        expect(this.uploadSpy.submit).toHaveBeenCalled();
                    })
                })

                context("with an existing object", function() {
                    beforeEach(function() {
                        this.model.set({id: '123'})
                        this.model.save();
                    })

                    it("uses AJAX", function() {
                        expect($.ajax).toHaveBeenCalled();
                    })
                })
            })
        })
    });
});