describe("chorus.models.Workfile", function() {
    beforeEach(function() {
        fixtures.model = "Workfile"
        this.model = fixtures.modelFor("fetch");
    });

    describe("#modifier", function() {
        it("returns a partially constructed user, based on the workfile's modifier attribute", function() {
            var modifier = this.model.modifier();
            expect(modifier.get("userName")).toBe(this.model.get("modifiedBy"));
            expect(modifier.get("firstName")).toBe(this.model.get("modifiedByFirstName"));
            expect(modifier.get("lastName")).toBe(this.model.get("modifiedByLastName"));
            expect(modifier.get("id")).toBe(this.model.get("modifiedById"))
        });
    })

    describe("#performValidation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires fileName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("fileName");
        });
    });

    describe("#initialize", function() {
        beforeEach(function() {
            this.model = new chorus.models.Workfile({id: 5, workspaceId: 10})
        });

        it("constructs the right backend URL", function() {
            expect(this.model.url()).toBe("/edc/workspace/10/workfile/5");
            expect(this.model.url(true)).toBe("workspace/10/workfile/5");
        });

        it("constructs the right frontend show URL", function() {
            expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5");
            expect(this.model.showUrl(true)).toBe("workspaces/10/workfiles/5");
        });
    });

    describe("isImage", function() {
        context("when the workfile is an image", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "image/jpeg" });
            });

            it("returns true", function() {
                expect(this.model.isImage()).toBeTruthy();
            });
        });

        context("when the workfile is NOT an image", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "text/plain" });
            });

            it("returns false", function() {
                expect(this.model.isImage()).toBeFalsy();
            });
        });
    });

    describe("isText", function() {
        context("when the workfile is a plain textfile", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "text/plain" });
            });

            it("returns true", function() {
                expect(this.model.isText()).toBeTruthy();
            });
        });

        context("when the workfile is an html file", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "text/html" });
            });

            it("returns true", function() {
                expect(this.model.isText()).toBeTruthy();
            });
        });

        context("when the workfile is an sql file", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "text/x-sql" });
            });

            it("returns true", function() {
                expect(this.model.isText()).toBeTruthy();
            });
        });

        context("when the workfile is NOT text", function() {
            beforeEach(function() {
                this.model.set({ mimeType : "image/jpeg" });
            });

            it("returns false", function() {
                expect(this.model.isText()).toBeFalsy();
            });
        });
    });
});
