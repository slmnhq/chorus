describe("WorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workfile({});
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(true);
                spyOn(chorus.views, "ImageWorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContentDetails).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is NOT an image", function() {
            beforeEach(function() {
                spyOn(this.model, 'isImage').andReturn(false);
                spyOn(chorus.views, "WorkfileContentDetails");
                chorus.views.WorkfileContentDetails.buildFor = chorus.views.WorkfileContentDetails.originalValue.buildFor;
                chorus.views.WorkfileContentDetails.buildFor(this.model);
            });

            it("instantiates an WorkfileContentDetails view with the given workfile", function() {
                expect(chorus.views.WorkfileContentDetails).toHaveBeenCalledWith({ model : this.model });
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.loadTemplate("workfile_content_details")
            this.view = new chorus.views.WorkfileContentDetails(this.model);
            this.view.render();
        })

        it("has the three action links in the details bar", function() {
            expect(this.view.$("a").length).toBe(3);
        });

    })
});
