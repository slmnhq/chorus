describe("WorkfileContent", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workfile({});
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(true);
                spyOn(chorus.views, "ImageWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContent view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is NOT an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(false);
                spyOn(chorus.views, "WorkfileContent");
                chorus.views.WorkfileContent.buildFor = chorus.views.WorkfileContent.originalValue.buildFor;
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an WorkfileContent view with the given workfile", function() {
                expect(chorus.views.WorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });
    });
});
