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


        context("when the response is '403 forbidden'", function() {
            beforeEach(function() {
                spyOn(this.resource, "trigger");
                this.data = {
                    response: { instanceId: 1 },
                    errors: { record: "no" }
                };

                this.xhr = { status: 403 };
            });

            itHandlesFailure();

            it("triggers fetchForbidden on the resource", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect(this.resource.trigger).toHaveBeenCalledWith("fetchForbidden");
            });
        });

        context("when the response is '404 not found'", function() {
            beforeEach(function() {
                spyOn(this.resource, "trigger");
                this.data = {
                    response: { instanceId: 1 },
                    errors: { record: "no" }
                };

                this.xhr = { status: 404 };
            });

            itHandlesFailure();

            it("triggers fetchNotFound on the resource", function() {
                this.resource.parseErrors(this.data, this.xhr);
                expect(this.resource.trigger).toHaveBeenCalledWith("fetchNotFound");
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

    describe("#fetch", function() {
        beforeEach(function() {
            this.errorSpy = jasmine.createSpy("error");
            this.successSpy = jasmine.createSpy("success");
            this.fetchFailedSpy = jasmine.createSpy("fetchFailed");
            this.loadedSpy = jasmine.createSpy("loaded");

            this.resource.bind("fetchFailed", this.fetchFailedSpy);
            this.resource.bind("loaded", this.loadedSpy);

            this.resource.fetch({
                success: this.successSpy,
                error: this.errorSpy,
            });
        });

        context("when there is a server error", function() {
            it("triggers the 'fetchFailed' event on the resource", function() {
                this.server.lastFetch().failUnprocessableEntity();
                expect(this.fetchFailedSpy).toHaveBeenCalled();
                expect(this.fetchFailedSpy.mostRecentCall.args[0]).toBe(this.resource);
            });
        });

        context("when the response is '403 forbidden'", function() {
            it("does not trigger 'loaded", function() {
                this.server.lastFetch().failForbidden({custom: "error"});
                expect(this.loadedSpy).not.toHaveBeenCalled();
            });

            it("fills serverErrors from the errors key", function() {
                this.server.lastFetch().failForbidden({custom: "error"});
                expect(this.resource.serverErrors).toEqual({custom: "error"});
            });

            it("calls the 'error' callback if one is provided", function() {
                this.server.lastFetch().failForbidden({custom: "error"});
                expect(this.errorSpy).toHaveBeenCalled();
            });

            it("triggers the 'fetchFailed' event on the resource after populating the data", function() {
                var resource = this.resource;
                this.fetchFailedSpy.andCallFake(function() {
                    expect(resource.serverErrors).toEqual({custom: "error"});
                });

                this.server.lastFetch().failForbidden({custom: "error"});

                expect(this.fetchFailedSpy).toHaveBeenCalled();
                expect(this.fetchFailedSpy.mostRecentCall.args[0]).toBe(this.resource);
            });
        });

        context("when the fetch succeeds", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed();
            });

            it("triggers the 'loaded' event on the resource", function() {
                expect(this.loadedSpy).toHaveBeenCalled();
            });

            it("calls the 'success' callback if one is provided", function() {
                expect(this.successSpy).toHaveBeenCalled();
            });
        });

        context("when there is an error with a single space in the response text", function() {
            beforeEach(function() {
                this.fetchFailedSpy.reset();
                this.server.lastFetch().respond(401, {'Content-Type': 'application/json'}, " ");
            });

            it("does not crash", function() {
                expect(this.fetchFailedSpy).toHaveBeenCalled();
            });
        });
    });
});
