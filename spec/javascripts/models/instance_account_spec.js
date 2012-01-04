describe("chorus.models.InstanceAccount", function() {
    beforeEach(function() {
        this.model = fixtures.instanceAccount({ id: '72' });
    });

    describe("#url", function() {
        context("when saving", function() {
            it("has the right url for locating an account by its id", function() {
                expect(this.model.url({ method: 'create' })).toBe("/edc/instance/accountmap/72");
            });
        });

        context("when fetching, with no url parameters set", function() {
            it("has the right url for locating an account by its id", function() {
                expect(this.model.url({ method: 'read' })).toBe("/edc/instance/accountmap/72");
            });
        });

        context("when fetching, with an instanceId url param set", function() {
            beforeEach(function() {
                this.model.urlParams = { instanceId: '45' };
            });

            it("has the right url for fetching based on the instance id", function() {
                expect(this.model.url({ method: "read" })).toBe("/edc/instance/accountmap?instanceId=45");
            });
        });
    });

    describe("#fetchByInstanceId", function() {
        it("hits the correct url", function() {
            chorus.models.InstanceAccount.findByInstanceId("4");
            expect(this.server.requests[0].url).toBe("/edc/instance/accountmap?instanceId=4")
        })

        it("returns an InstanceAccount", function() {
            var model = chorus.models.InstanceAccount.findByInstanceId("4");
            expect(model instanceof chorus.models.InstanceAccount).toBeTruthy()
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
