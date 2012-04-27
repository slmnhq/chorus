describe("chorus.Mixins.Fetching", function() {
    beforeEach(function() {
        this.resource = new chorus.models.Base();
        this.resource.urlTemplate = "foo";
    });

    describe("fetchIfNotLoaded", function() {
        beforeEach(function() {
            spyOn(this.resource, 'fetch').andCallThrough();
        });

        context("when not loaded or fetching", function() {
            it("starts a fetch", function() {
                this.resource.fetchIfNotLoaded();
                expect(this.resource.fetch).toHaveBeenCalled();
            })
        })

        context("when loaded", function() {
            beforeEach(function() {
                this.resource.loaded = true;
            })

            it("it won't start fetching again", function() {
                this.resource.fetchIfNotLoaded();
                expect(this.resource.fetch).not.toHaveBeenCalled();
            })
        })

        context("when fetching", function() {
            beforeEach(function() {
                this.resource.fetch();
            })

            it("it won't start a second fetch", function() {
                this.resource.fetch.reset();
                this.resource.fetchIfNotLoaded();
                expect(this.resource.fetch).not.toHaveBeenCalled();
            });
        });

        context("after fetch completes", function() {
            beforeEach(function() {
                this.resource.fetch();
                this.server.completeFetchFor(this.resource);
            })

            context("if the model is declared unloaded", function() {
                beforeEach(function() {
                    this.resource.loaded = false;
                    this.resource.fetch.reset();
                })

                it('will fetch again', function() {
                    this.resource.fetchIfNotLoaded();
                    expect(this.resource.fetch).toHaveBeenCalled();
                })
            })
        });

        context("after the fetch fails", function() {
            beforeEach(function() {
                this.resource.fetch();
                this.server.lastFetchFor(this.resource).failUnprocessableEntity();
                this.resource.fetch.reset();
            });

            it('will fetch again', function() {
                this.resource.fetchIfNotLoaded();
                expect(this.resource.fetch).toHaveBeenCalled();
            })
        });

        context("after the fetch errors", function() {
            beforeEach(function() {
                this.resource.fetch();
                this.server.lastFetchFor(this.resource).error();
                this.resource.fetch.reset();
            });

            it('will fetch again', function() {
                this.resource.fetchIfNotLoaded();
                expect(this.resource.fetch).toHaveBeenCalled();
            })
        });

        context("fetching with options", function() {
            beforeEach(function() {
                this.resource.fetchIfNotLoaded({rows: 10});
            });
            it("should pass options to fetch", function() {
                expect(this.resource.fetch.mostRecentCall.args[0].rows).toBe(10);
            })
        });
    });

    describe("#parseErrors", function() {
        beforeEach(function() {
            this.things = [
                {hi: "there"},
                {go: "away"}
            ];
        });

        context("when the staus is 'needlogin'", function() {
            it("triggers needsLogin on chorus.session", function() {
                spyOn(chorus.session, "trigger");
                this.resource.parseErrors({status: "needlogin"});
                expect(chorus.session.trigger).toHaveBeenCalledWith("needsLogin");
            });
        });

        context("when the status is 'ok'", function() {
            it("sets loaded", function() {
                this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'ok'});
                expect(this.resource.loaded).toBeTruthy();
            });

            it("returns a falsy value (the model has no errors)", function() {
                expect(this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'ok'})).toBeFalsy();
            });
        });

        context("when the status is NOT 'ok'", function() {
            it("does not set loaded", function() {
                this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'fail'});
                expect(this.resource.loaded).not.toBeTruthy();
            });

            it("returns the server's errors", function() {
                expect(this.resource.parseErrors({
                    status: 'fail',
                    message: [{ message: "some problem" }],
                    resource: this.things
                })).toBeTruthy();
            });

            it("stores the returned resource as the resource's errorData", function() {
                this.resource.parseErrors({
                    status: 'fail',
                    message: [{ message: "some problem" }],
                    resource: [{ instanceId: "101", instanceName: "Joe Instance" }]
                });
                expect(this.resource.errorData).toEqual({ instanceId: "101", instanceName: "Joe Instance" });
            });
        });
    });
});
