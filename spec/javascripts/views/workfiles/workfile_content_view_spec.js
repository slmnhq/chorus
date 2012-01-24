describe("WorkfileContent", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workfile({});
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                this.model = fixtures.imageWorkfile();
                spyOn(chorus.views, "ImageWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContent view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a text file", function() {
            beforeEach(function() {
                this.model = fixtures.textWorkfile();
                spyOn(chorus.views, "TextWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an TextWorkfileContent view with the given workfile", function() {
                expect(chorus.views.TextWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a sql file", function() {
            beforeEach(function() {
                this.model = fixtures.sqlWorkfile();
                spyOn(chorus.views, "SqlWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an SqlWorkfileContent view with the given workfile", function() {
                expect(chorus.views.SqlWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        })

        context("when the given workfile is nothing special", function() {
            beforeEach(function() {
                this.model = fixtures.otherWorkfile();
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
