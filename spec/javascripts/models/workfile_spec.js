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

    describe("#lastComment", function() {
        beforeEach(function() {
            this.comment = this.model.lastComment();
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe("I am loving commenting");
        });

        it("has the right creator", function() {
            var creator = this.comment.author()
            expect(creator.get("id")).toBe("InitialUser");
            expect(creator.get("firstName")).toBe("EDC");
            expect(creator.get("lastName")).toBe("Admin");
        });

        context("when the workfile doesn't have any comments", function() {
            it("returns null", function() {
                expect(new chorus.models.Workfile().lastComment()).toBeFalsy();
            });
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires fileName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("fileName", undefined);
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

        describe("#downloadUrl", function() {
            beforeEach(function(){
                this.model.set({versionFileId: "12345"});
            });

            it("returns the correct URL", function() {
                expect(this.model.downloadUrl()).toBe("/edc/workspace/10/workfile/5/file/12345?download=true");
            });
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
