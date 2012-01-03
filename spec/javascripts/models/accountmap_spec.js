describe("chorus.models.Accountmap", function() {
    beforeEach(function() {
        this.model = fixtures.accountmap({ id: '72' });
    });

    describe("urlTemplate", function() {
        context("when an instanceId url param is set", function() {
            beforeEach(function() {
                this.model.urlParams = { instanceId: '45' };
            });

            it("has the right url", function() {
                expect(this.model.url()).toBe("/edc/instance/accountmap?instanceId=45");
            });
        });

        context("when NO instanceId url param is set", function() {
            it("has the right url", function() {
                expect(this.model.url()).toBe("/edc/instance/accountmap/72");
            });
        });
    });

    describe("#fetchByInstanceId", function() {
        it("hits the correct url", function() {
            chorus.models.Accountmap.findByInstanceId("4");
            expect(this.server.requests[0].url).toBe("/edc/instance/accountmap?instanceId=4")
        })

        it("returns an Accountmap", function() {
            var model = chorus.models.Accountmap.findByInstanceId("4");
            expect(model instanceof chorus.models.Accountmap).toBeTruthy()
        })
    })

    describe("validations", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("requires dbUserName", function() {
            this.model.unset("dbUserName");
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("dbUserName", undefined);
        });

        it("does not require dbPassword", function() {
            this.model.unset("dbPassword");
            this.model.performValidation();
            expect(this.model.require).not.toHaveBeenCalledWith("dbPassword", undefined);
        });
    })
});
