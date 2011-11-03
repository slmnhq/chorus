describe("chorus.models.Base", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base();
        this.model.urlTemplate = "";
    });

    describe("#save", function() {
        beforeEach(function() {
            this.model.save();
            this.savedSpy = jasmine.createSpy();
            this.model.bind("saved", this.savedSpy);
        });

        describe("when the request succeeds", function() {
            beforeEach(function() {
                this.response = { status: "ok", resource : [
                    { foo : "hi" }
                ] };

                this.server.respondWith(
                    'POST',
                    '/edc/',
                    this.prepareResponse(this.response));

                this.server.respond();
            });

            it("triggers a saved event", function() {
                expect(this.savedSpy).toHaveBeenCalled();
            })
        })

        describe("when the request fails", function() {
            beforeEach(function() {

                this.response = { status: "fail", message : [
                    { message : "hi" },
                    { message : "bye" }
                ] };
                this.server.respondWith(
                    'POST',
                    '/edc/',
                    this.prepareResponse(this.response));
                this.server.respond();

            });

            it("returns the error information", function() {
                expect(this.model.get('errors')).toEqual(this.response.message);
            })

            describe("and then another request succeeds", function() {
                beforeEach(function() {
                    this.response = { status: "ok", resource : [
                        { foo : "hi" }
                    ] };

                    this.server = sinon.fakeServer.create();
                    this.server.respondWith(
                        'POST',
                        '/edc/',
                        this.prepareResponse(this.response));

                    this.model.save();
                    this.server.respond();
                });
                it("should trigger the saved event", function(){
                    expect(this.savedSpy).toHaveBeenCalled();
                });

                it("clears the error information", function() {
                    expect(this.model.get('errors')).toBeUndefined();
                })
            })
        })
    });
});
