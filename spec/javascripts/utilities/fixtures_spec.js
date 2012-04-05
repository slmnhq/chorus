describe("newFixtures", function() {
    describe("#user", function() {
        var user;

        beforeEach(function() {
            user = newFixtures.user();
        });

        it("should create a user model", function() {
            expect(user).toBeA(chorus.models.User);
        });

        it("sets attributes of the model based on the fixtureData", function() {
            expect(window.fixtureData.user).toBeDefined();
            expect(window.fixtureData.user.userName).toBeDefined();
            expect(user.get("userName")).toBe(window.fixtureData.user.userName);
        });

        it("allows for overrides", function() {
            user = newFixtures.user({userName: "Foo Bar"});
            expect(user.get("userName")).toBe("Foo Bar");
        });

        it("does not allow overrides for non-existant attributes", function() {
            expect(function() {newFixtures.user({foo: "Bar"})}).toThrow();
        });

        it("gives each user a unique id", function() {
            var user2 = newFixtures.user();
            expect(user2.get("id")).not.toEqual(user.get("id"));
        });
    });

    describe("#addUniqueAttrs(attributes, names)", function() {
        var attributes1, attributes2;

        beforeEach(function() {
            attributes1 = {
                id: "101",
                name: "foo",
                workspace: {
                    id: "102",
                    name: "Bums",
                    sandbox: {
                        id: "103",
                        name: "data-land"
                    }
                }
            };

            attributes2 = _.clone(attributes1);
            attributes2.workspace = _.clone(attributes1.workspace);
            attributes2.workspace.sandbox = _.clone(attributes1.workspace.sandbox);

            newFixtures.addUniqueAttrs(attributes1, [ "id" ]);
            newFixtures.addUniqueAttrs(attributes2, [ "id" ]);
        });

        it("replaces the values of matching properties with unique string ids", function() {
            expect(attributes1.id).toBeA("string");

            expect(attributes1.id).not.toEqual(attributes2.id);
            expect(attributes1.workspace.id).not.toEqual(attributes2.workspace.id);
            expect(attributes1.workspace.sandbox.id).not.toEqual(attributes2.workspace.sandbox.id);
        });

        it("leaves non-matching properties as they are", function() {
            expect(attributes1.name).toBe("foo");
            expect(attributes1.workspace.name).toBe("Bums");
            expect(attributes1.workspace.sandbox.name).toBe("data-land");
        });
    });

    describe("#safeExtend", function() {
        var result, target;

        beforeEach(function() {
            target = {
                foo: "bar",
                baz: "quux",
                nestedObjectArray: [
                    {
                        name: "ryan",
                        id: 3
                    },
                    {
                        name: "bleicke",
                        id: 4
                    }
                ],
                nestedStringArray: [
                    "Bob", "Jim", "Jim-Bob"
                ],
                nestedObject: {
                    name: "joe",
                    id: 5
                }
            };
        });

        context("when no overrides are specified", function() {
            it("returns the target", function() {
                var result = newFixtures.safeExtend(target, undefined);
                expect(result).toEqual(target);
            });
        });

        context("when a property is overriden", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(target, { foo: "pizza" });
            });

            it("uses the override", function() {
                expect(result.foo).toBe("pizza");
            });

            it("preserves the other keys in the original object", function() {
                expect(result.baz).toBe("quux");
            });

            context("when the overrides contain a key that is not present in the original object", function() {
                it("throws an exception containing the specified name", function() {
                    expect(function() {
                        newFixtures.safeExtend(target, { whippedCream: "lots" }, "user");
                    }).toThrow("The fixture 'user' has no key 'whippedCream'");
                });
            });
        });

        context("when overriding a key in a nested object", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(target, {
                    nestedObject: {
                        name: "pizza"
                    }
                });
            });

            it("does not mutate the original object", function() {
                expect(target.nestedObject).toEqual({
                    name: "joe",
                    id: 5
                });
            });

            it("uses the override", function() {
                expect(result.nestedObject.name).toBe("pizza");
            });

            it("preserves the other keys in the original object", function() {
                expect(result.nestedObject.id).toBe(5);
            });

            context("when the overrides contain a key that is not present in the nested object", function() {
                it("throws an exception containing the specified name", function() {
                    expect(function() {
                        newFixtures.safeExtend(target, { nestedObject: { hamburger: "double" }}, "user")
                    }).toThrow("The fixture 'user.nestedObject' has no key 'hamburger'");
                });
            });

            it("does not allow keys that aren't present in the nested object", function() {
            });
        });

        context("when overriding a value in a nested array", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(target, {
                    nestedStringArray: [
                        "Pivotal", "Labs", "Is", "Awesome"
                    ]
                });
            });

            it("uses the new values as-is", function() {
                expect(result.nestedStringArray).toEqual(["Pivotal", "Labs", "Is", "Awesome"]);
            });
        });

        context("when overriding an object in a nested array", function() {
            context("when the length of the override array is less than or equal to the original arrays' length", function() {
                beforeEach(function() {
                    result = newFixtures.safeExtend(target, {
                        nestedObjectArray: [
                            { name: "bazillionaire" }
                        ]
                    });
                });

                it("uses the overridden properties", function() {
                    expect(result.nestedObjectArray[0].name).toBe("bazillionaire");
                });

                it("keeps each of the orginal objects' other properties", function() {
                    expect(result.nestedObjectArray[0].id).toBe(3);
                });

                it("keeps any elements in the original array which were not overridden", function() {
                    expect(result.nestedObjectArray[1].name).toBe('bleicke');
                    expect(result.nestedObjectArray[1].id).toBe(4);
                });
            });

            context("when the override array is longer than the original array", function() {
                beforeEach(function() {
                    result = newFixtures.safeExtend(target, {
                        nestedObjectArray: [
                            { name: "bazillionaire" },
                            { name: "gajillionaire" },
                            { name: "google" }
                        ]
                    });
                });

                it("uses the supplied values as-is", function() {
                    expect(result.nestedObjectArray[2]).toEqual({ name: "google" });
                });
            });
        });
    });
});
