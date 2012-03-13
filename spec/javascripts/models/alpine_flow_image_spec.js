describe("chorus.models.AlpineFlowImage", function() {
    beforeEach(function() {
        this.model = new chorus.models.AlpineFlowImage({workfileDiskPath: "/a/b/c.afm"})
        this.changeSpy = jasmine.createSpy();
        this.model.bind('change', this.changeSpy);
        this.model.fetch();
    });

    it("fetches from the AlpineIlluminator API", function() {
        expect(this.server.lastFetch().url).toBe("/AlpineIlluminator/main/flow.do?method=getFlowImage&flowFilePath=%2Fa%2Fb%2Fc.afm")
    });

    context("when fetch completes successfully", function() {
        beforeEach(function() {
            this.server.lastRequest().respond(
                200,
                { 'Content-Type': 'text/plain' },
                "/p/q.png");
        });

        it("triggers change event", function() {
            expect(this.changeSpy).toHaveBeenCalled();
        });

        it("has an imageFilePath", function() {
            expect(this.model.get("imageFilePath")).toBe('/alpine/p/q.png')
        });

        it("reports it was found", function() {
            expect(this.model.get("found")).toBeTruthy();
        });

        it("reports it was loaded", function() {
            expect(this.model.loaded).toBeTruthy();
        });
    });

    context("when fetch returns non-200 response", function() {
        beforeEach(function() {
            this.server.lastRequest().respond(
                404,
                { },
                "");
        });

        it("triggers change event", function() {
            expect(this.changeSpy).toHaveBeenCalled();
        });

        it("does not have an imageFilePath", function() {
            expect(this.model.has("imageFilePath")).toBeFalsy();
        });

        it("reports it was not found", function() {
            expect(this.model.get("found")).toBeFalsy();
        });

        it("reports it was loaded", function() {
            expect(this.model.loaded).toBeTruthy();
        });
    });

    context("when fetch returns empty response", function() {
        beforeEach(function() {
            this.server.lastRequest().respond(
                200,
                { 'Content-Type': 'text/plain' },
                "");
        });

        it("triggers change event", function() {
            expect(this.changeSpy).toHaveBeenCalled();
        });

        it("does not have an imageFilePath", function() {
            expect(this.model.has("imageFilePath")).toBeFalsy();
        });

        it("reports it was not found", function() {
            expect(this.model.get("found")).toBeFalsy();
        });

        it("reports it was loaded", function() {
            expect(this.model.loaded).toBeTruthy();
        });
    });
});