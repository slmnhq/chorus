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

            this.xhrOk = { status: 200 };
        });

        context("when the staus is 'needlogin'", function() {
            it("triggers needsLogin on chorus.session", function() {
                spyOn(chorus.session, "trigger");
                this.resource.parseErrors({status: "needlogin"}, this.xhrOk);
                expect(chorus.session.trigger).toHaveBeenCalledWith("needsLogin");
            });
        });

        context("when the status is 'ok'", function() {
            it("sets loaded", function() {
                this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'ok'}, this.xhrOk);
                expect(this.resource.loaded).toBeTruthy();
            });

            it("returns a falsy value (the model has no errors)", function() {
                expect(this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'ok'}, this.xhrOk)).toBeFalsy();
            });
        });

        context("when the status is NOT 'ok'", function() {
            it("does not set loaded", function() {
                this.resource.parseErrors({ foo: "bar", resource: this.things, status: 'fail'}, this.xhrOk);
                expect(this.resource.loaded).not.toBeTruthy();
            });

            it("returns the server's errors", function() {
                expect(this.resource.parseErrors({
                    status: 'fail',
                    message: [{ message: "some problem" }],
                    resource: this.things
                }, this.xhrOk)).toBeTruthy();
            });

            it("stores the returned resource as the resource's errorData", function() {
                this.resource.parseErrors({
                    status: 'fail',
                    message: [{ message: "some problem" }],
                    response: { instanceId: "101", instanceName: "Joe Instance" }
                }, this.xhrOk);
                expect(this.resource.errorData).toEqual({ instanceId: "101", instanceName: "Joe Instance" });
            });
        });

        context("when the response is '403 forbidden'", function() {
            beforeEach(function() {
                this.attributes = this.resource.parseErrors({
                    response: { foo: "bar" },
                    errors: { record: "bad" }
                }, {
                    status: 403
                });
            });

            it("returns truthy", function() {
                expect(this.attributes).toBeTruthy();
            });

            it("sets the model's 'errorData' based on the response", function() {
                expect(this.resource.errorData).toEqual({
                    foo: "bar"
                });
            });

            it("sets the model's 'serverErrors' based on the 'errors' key", function() {
                expect(this.resource.serverErrors).toEqual({
                    record: "bad"
                });
            });
        });
    });
});
