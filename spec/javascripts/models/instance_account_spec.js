describe("chorus.models.InstanceAccount", function() {
    beforeEach(function() {
        this.model = fixtures.instanceAccount({ id: '72', instanceId: '1045', userName: 'iceCream' });
    });

    describe("#url", function() {
        context("when updating or deleting", function() {
            it("has the right url for accessing an account by its id", function() {
                expect(this.model.url({ method: 'update' })).toBe("/edc/instance/accountmap/72");
                expect(this.model.url({ method: 'delete' })).toBe("/edc/instance/accountmap/72");
            });
        });

        context("when creating", function() {
            it("has the base url for accounts (no id)", function() {
                expect(this.model.url({ method: 'create' })).toBe("/edc/instance/accountmap");
            });
        });

        context("when fetching", function() {
            it("has the right url for fetching an account by user name and instance id", function() {
                var url = this.model.url({ method: 'read' });
                expect(url).toContain("/edc/instance/accountmap");
                expect(url).toContain("instanceId=1045");
                expect(url).toContain("userName=iceCream");
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
