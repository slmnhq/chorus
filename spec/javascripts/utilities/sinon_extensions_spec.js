describe("sinon extensions", function() {
    beforeEach(function() {
        this.errors = { record: "not accessible" };
        this.response = { instanceId: 1 };
        this.fakeRequest = new sinon.FakeXMLHttpRequest();
    });

    describe("XHR#succeed", function() {
        beforeEach(function() {
            var resource = new chorus.models.User();
            resource.fetch();
            this.xhr = this.server.lastFetch();
        });

        context("when given a model", function() {
            beforeEach(function() {
                this.model = new chorus.models.Base({ foo: "bar" })
                this.xhr.succeed(this.model);
            });

            it("returns a 200 status", function() {
                this.xhr.succeed(newFixtures.user());
                expect(this.xhr.status).toBe(200);
            });

            it("returns the right content-type", function() {
                this.xhr.succeed(newFixtures.user());
                expect(this.xhr.responseHeaders["Content-Type"]).toBe("application/json");
            });

            it("makes 'response' key a hash of the model's attributes", function() {
                expect(JSON.parse(this.xhr.responseText).response).toEqual({
                    foo: "bar"
                });
            });
        });

        context("when given an array of models", function() {
            beforeEach(function() {
                this.xhr.succeed([
                    new chorus.models.Base({ foo: "bar" }),
                    new chorus.models.Base({ baz: "quux" })
                ], {
                    page: 1,
                    total: 5,
                    records: 100
                });
            });

            it("makes the 'response' key an array containing each model's attributes", function() {
                expect(JSON.parse(this.xhr.responseText).response).toEqual([
                    { foo: "bar" },
                    { baz: "quux" }
                ]);
            });

            it("includes the 'pagination' key, if passed", function() {
                expect(JSON.parse(this.xhr.responseText).pagination).toEqual({
                    page: 1,
                    total: 5,
                    records: 100
                });
            });
        });
    });

    describe("#lastFetchFor", function() {
        context("when #fetchAll was called on a collection (setting a non-default 'rows' parameter)", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.UserSet();
                this.collection.fetchAll();
            });

            it("returns the request made by #fetchAll", function() {
                expect(this.server.lastFetchFor(this.collection)).toBeDefined();
            });
        });
    });

    describe("#completeFetchFor", function() {
        beforeEach(function() {
            this.model = new chorus.models.User({ id: '1' });
            this.collection = new chorus.collections.UserSet();

            this.model.fetch();
            this.collection.fetch()
        });

        context("it is called with a specified result", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.model, { name: "John Smith", secretIdentity: "Neo" });
            });

            it("succeeds with the specified result", function() {
                expect(this.model.get('name')).toBe("John Smith");
                expect(this.model.loaded).toBeTruthy();
            });
        });

        context("when no result is passed", function() {
            context("it is called with a backbone model", function() {
                beforeEach(function() {
                    var user = new chorus.models.User({ id: '1', name: "Keanu Reeves" });
                    this.server.completeFetchFor(user);
                });

                it("uses the current attributes of the model", function() {
                    expect(this.model.get('name')).toBe("Keanu Reeves");
                    expect(this.model.loaded).toBeTruthy();
                });
            });

            context("it is called with a collection", function() {
                beforeEach(function() {
                    var otherCollection = new chorus.collections.UserSet([], { group: "Agents" });
                    this.server.completeFetchFor(otherCollection);
                });

                it("uses an empty model set", function() {
                    expect(this.collection.models.length).toBe(0)
                    expect(this.collection.get('group')).toBeUndefined();
                    expect(this.collection.loaded).toBeTruthy();
                });
            });
        });
    });

    describe("#makeFakeResponse(modelOrCollection, response)", function() {
        context("when called with a specified response", function() {
            it("returns the specified response", function() {
                var fakeRequest = this.server.makeFakeResponse(this.model, {
                    name: "John Smith",
                    secretIdentity: "Neo"
                });
                expect(fakeRequest).toEqual({
                    name: "John Smith",
                    secretIdentity: "Neo"
                });
            });
        });

        context("when no response is passed", function() {
            context("and it is called with a backbone model", function() {
                it("uses the current attributes of the model", function() {
                    var user = new chorus.models.User({ id: '1', name: "Keanu Reeves" });
                    var fakeRequest = this.server.makeFakeResponse(user);
                    expect(fakeRequest).toEqual({ id: '1', name: "Keanu Reeves" });
                });
            });

            context("it is called with a collection", function() {
                it("uses an empty model set", function() {
                    var collection = new chorus.collections.UserSet([], { group: "Agents" })
                    expect(this.server.makeFakeResponse(collection)).toEqual([]);
                });
            });
        });
    });

    describe("#fail", function() {
        beforeEach(function() {
            this.fakeRequest.fail()
        });

        itReturnsStatus(200);

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeRequest.responseText).toContain("something went wrong!");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeRequest.responseText).toContain("fail");
        });
    });

    describe("#failForbidden", function() {
        beforeEach(function() {
            this.fakeRequest.failForbidden(this.errors, this.response)
        });

        itReturnsStatus(403);
        itIncludesErrorAndResponse();
    });

    describe("#failUnauthorized", function() {
        beforeEach(function() {
            this.fakeRequest.failUnauthorized(this.errors, this.response);
        });

        itReturnsStatus(401);
        itIncludesErrorAndResponse();
    });

    describe("#failNotFound", function() {
        beforeEach(function() {
            this.fakeRequest = new sinon.FakeXMLHttpRequest();
            this.fakeRequest.failNotFound(this.errors, this.response);
        });

        itReturnsStatus(404);
        itIncludesErrorAndResponse();
    });

    describe("#failUnprocessableEntity", function() {
        beforeEach(function() {
            this.fakeRequest.failUnprocessableEntity({message: "whatever"})
        });

        itReturnsStatus(200);

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeRequest.responseText).toContain("whatever");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeRequest.responseText).toContain("fail");
        });
    });

    function itReturnsStatus(code) {
        it("returns a status code of " + code, function() {
            expect(this.fakeRequest.status).toBe(code);
        });
    }

    function itIncludesErrorAndResponse() {
        it("returns an error message in the 'message' field", function() {
            expect(JSON.parse(this.fakeRequest.responseText).errors).toEqual(this.errors);
        });

        it("includes the response if one is given", function() {
            expect(JSON.parse(this.fakeRequest.responseText).response).toEqual(this.response);
        });
    }
});
