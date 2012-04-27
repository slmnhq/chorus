describe("sinon extensions", function() {
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
            this.model = new chorus.models.User({ id: '1' })
            this.collection = new chorus.collections.UserSet()

            this.model.fetch()
            this.collection.fetch()
        })

        context("it is called with a specified result", function(){
            beforeEach(function() {
                this.server.completeFetchFor(this.model, { name: "John Smith", secretIdentity: "Neo" })
            })

            it("succeeds with the specified result", function() {
                expect(this.model.get('name')).toBe("John Smith")
                expect(this.model.loaded).toBeTruthy()
            })
        })

        context("when no result is passed", function() {
            context("it is called with a backbone model", function() {
                beforeEach(function() {
                    var user = new chorus.models.User({ id: '1', name: "Keanu Reeves" });
                    this.server.completeFetchFor(user);
                });

                it("uses the current attributes of the model", function() {
                    expect(this.model.get('name')).toBe("Keanu Reeves")
                    expect(this.model.loaded).toBeTruthy()
                })
            })

            context("it is called with a collection", function() {
                beforeEach(function() {
                    var otherCollection = new chorus.collections.UserSet([], { group: "Agents" })
                    this.server.completeFetchFor(otherCollection);
                });

                it("uses an empty model set", function() {
                    expect(this.collection.models.length).toBe(0)
                    expect(this.collection.get('group')).toBeUndefined()
                    expect(this.collection.loaded).toBeTruthy()
                })
            })
        });
    });

    describe("#makeFakeResponse(modelOrCollection, response)", function() {
        context("when called with a specified response", function(){
            it("returns the specified response", function() {
                var fakeResponse = this.server.makeFakeResponse(this.model, {
                    name: "John Smith",
                    secretIdentity: "Neo"
                });
                expect(fakeResponse).toEqual({
                    name: "John Smith",
                    secretIdentity: "Neo"
                });
            })
        })

        context("when no response is passed", function() {
            context("and it is called with a backbone model", function() {
                it("uses the current attributes of the model", function() {
                    var user = new chorus.models.User({ id: '1', name: "Keanu Reeves" });
                    var fakeResponse = this.server.makeFakeResponse(user);
                    expect(fakeResponse).toEqual({ id: '1', name: "Keanu Reeves" });
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
            this.fakeResponse = new sinon.FakeXMLHttpRequest();
            this.fakeResponse.fail()
        });

        it("returns a status code of 200", function() {
            expect(this.fakeResponse.status).toBe(200);
        });

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeResponse.responseText).toContain("something went wrong!");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeResponse.responseText).toContain("fail");
        });
    });

    describe("#failForbidden", function() {
        beforeEach(function() {
            this.fakeResponse = new sinon.FakeXMLHttpRequest();
            this.fakeResponse.failForbidden({message: "whatever"})
        });

        it("returns a status code of 200", function() {
            expect(this.fakeResponse.status).toBe(200);
        });

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeResponse.responseText).toContain("whatever");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeResponse.responseText).toContain("fail");
        });
    })

    describe("#failNotFound", function() {
        beforeEach(function() {
            this.fakeResponse = new sinon.FakeXMLHttpRequest();
            this.fakeResponse.failNotFound({message: "whatever"})
        });

        it("returns a status code of 200", function() {
            expect(this.fakeResponse.status).toBe(200);
        });

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeResponse.responseText).toContain("whatever");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeResponse.responseText).toContain("fail");
        });
    });

    describe("#failUnprocessableEntity", function() {
        beforeEach(function() {
            this.fakeResponse = new sinon.FakeXMLHttpRequest();
            this.fakeResponse.failUnprocessableEntity({message: "whatever"})
        });

        it("returns a status code of 200", function() {
            expect(this.fakeResponse.status).toBe(200);
        });

        it("returns an error message in the 'message' field", function() {
            expect(this.fakeResponse.responseText).toContain("whatever");
        });

        it("returns a 'fail' in the 'status' field", function() {
            expect(this.fakeResponse.responseText).toContain("fail");
        });
    });
});
