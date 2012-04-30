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

        context("when the status is 'fail'", function() {
            beforeEach(function() {
                this.data = {
                    status: "fail",
                    response: { instanceId: 1 },
                    errors: { record: "no" }
                };

                this.xhr = { status: 200 };
            });

            itHandlesFailure();
        });

        context("when the response is '403 forbidden'", function() {
            beforeEach(function() {
                this.data = {
                    response: { instanceId: 1 },
                    errors: { record: "no" }
                };

                this.xhr = { status: 403 };
            });

            itHandlesFailure();
        });

        context("when the response is '401 unauthorized'", function() {
            beforeEach(function() {
                spyOnEvent(chorus.session, "needsLogin");

                this.data = {
                    response: { foo: "bar" },
                    errors: { record: "bad" }
                };

                this.xhr = { status: 401 };
            });

            itHandlesFailure();

            it("triggers the 'needsLogin' event on the session", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect("needsLogin").toHaveBeenTriggeredOn(chorus.session);
            });
        });

        function itHandlesFailure() {
            it("does not set loaded", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect(this.resource.loaded).toBeFalsy();
            });

            it("stores the errors as the resource's 'serverErrors'", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect(this.resource.serverErrors).toBe(this.data.errors);
            });

            it("stores the returned response as the resource's errorData", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect(this.resource.errorData).toEqual(this.data.response);
            });
        }
    });
});
