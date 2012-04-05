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

        it("uses the override id, if one is specified", function() {
            var user2 = newFixtures.user({ id: '501' });
            expect(user2.get("id")).toBe("501");
        });
    });

    describe("#userSet", function() {
        var userSet;

        beforeEach(function() {
            userSet = newFixtures.userSet();
        });

        it("should create a UserSet collection", function() {
            expect(userSet).toBeA(chorus.collections.UserSet);
        });

        it("sets attributes of the models based on the fixture data", function() {
            var data = window.fixtureData.userSet[0];
            expect(data).toBeDefined();
            expect(data.userName).toBeDefined();
            expect(userSet.at(0).get("userName")).toBe(data.userName);
        });

        it("allows for overrides", function() {
            userSet = newFixtures.userSet([ { userName: "Foo Bar" } ]);
            expect(userSet.at(0).get("userName")).toBe("Foo Bar");
        });

        it("does not allow overrides for non-existant attributes", function() {
            expect(function() {
                newFixtures.userSet([ { foo: "Bar" } ]);
            }).toThrow();
        });

        it("gives each user a unique id", function() {
            var userSet2 = newFixtures.userSet();
            var ids = [
                userSet.at(0).id,
                userSet.at(1).id,
                userSet2.at(0).id,
                userSet2.at(1).id
            ];
            expect(_.uniq(ids).length).toBe(4);
        });

        it("uses the override id, if one is specified", function() {
            var userSet2 = newFixtures.userSet([ { id: '501' } ]);
            expect(userSet2.at(0).get("id")).toBe("501");
        });
    });

    describe("#addUniqueDefaults(attributes, nameStrings)", function() {
        context("when given an object", function() {
            var attributes1, attributes2;

            context("when the object already contains the attributes specified as unique", function() {
                beforeEach(function() {
                    attributes1 = {
                        id: "101",
                        name: "foo",
                        workspace: {
                            workspaceId: "102",
                            name: "Bums",
                            sandbox: {
                                sandboxId: null,
                                name: "data-land"
                            }
                        }
                    };

                    newFixtures.addUniqueDefaults(attributes1, [ "id", "workspace.workspaceId", "workspace.sandbox.sandboxId" ]);
                });

                it("does not change the properties (even if they are null)", function() {
                    expect(attributes1).toEqual({
                        id: "101",
                        name: "foo",
                        workspace: {
                            workspaceId: "102",
                            name: "Bums",
                            sandbox: {
                                sandboxId: null,
                                name: "data-land"
                            }
                        }
                    });
                });
            });

            context("when the object does not contain the attributes specified as unique", function() {
                beforeEach(function() {
                    attributes1 = {
                        name: "foo",
                        workspace: {
                            name: "Bums",
                            sandbox: {
                                name: "data-land"
                            }
                        }
                    };

                    attributes2 = _.clone(attributes1);
                    attributes2.workspace = _.clone(attributes1.workspace);
                    attributes2.workspace.sandbox = _.clone(attributes1.workspace.sandbox);

                    newFixtures.addUniqueDefaults(attributes1, [ "id", "workspace.workspaceId", "workspace.sandbox.sandboxId" ]);
                    newFixtures.addUniqueDefaults(attributes2, [ "id", "workspace.workspaceId", "workspace.sandbox.sandboxId" ]);
                });

                it("gives the object unique values for those attributes", function() {
                    expect(attributes1.id).toBeA("string");
                    expect(attributes1.workspace.workspaceId).toBeA("string");
                    expect(attributes1.workspace.sandbox.sandboxId).toBeA("string");

                    expect(attributes1.id).not.toEqual(attributes2.id);
                    expect(attributes1.workspace.workspaceId).not.toEqual(attributes2.workspace.workspaceId);
                    expect(attributes1.workspace.sandbox.sandboxId).not.toEqual(attributes2.workspace.sandbox.sandboxId);
                });

                it("leaves the object's other properties as they were", function() {
                    expect(attributes1.name).toBe("foo");
                    expect(attributes1.workspace.name).toBe("Bums");
                    expect(attributes1.workspace.sandbox.name).toBe("data-land");
                });
            });

            context("when the object does not have one of the nested objects specified in the unique list", function() {
                it("creates the nested object and the unique id inside of it", function() {
                    attributes1 = { name: "foo" };
                    attributes2 = { name: "foo" };
                    newFixtures.addUniqueDefaults(attributes1, [ "workspace.sandbox.id" ]);
                    newFixtures.addUniqueDefaults(attributes2, [ "workspace.sandbox.id" ]);
                    expect(attributes1.workspace.sandbox.id).toBeA("string")
                    expect(attributes2.workspace.sandbox.id).toBeA("string")
                    expect(attributes1.workspace.sandbox.id).not.toEqual(attributes2.workspace.sandbox.id);
                });
            });
        });

        context("when given an array", function() {
            var attrArray1, attrArray2;

            beforeEach(function() {
                attrArray1 = [
                    {
                        name: "roger",
                    },
                    {
                        name: "anton",
                        workspace: {
                            name: "the kewl kids club"
                        }
                    }
                ];

                attrArray2 = _.clone(attrArray1);
                attrArray2[0] = _.clone(attrArray1[0]);
                attrArray2[1] = _.clone(attrArray1[1]);
                attrArray2[1].workspace = _.clone(attrArray1[1].workspace);
            });

            it("it adds the unique attribute values to each object in the array", function() {
                newFixtures.addUniqueDefaults(attrArray1, [ "id", "workspace.id" ]);
                newFixtures.addUniqueDefaults(attrArray2, [ "id", "workspace.id" ]);

                var ids = [
                    attrArray1[0].id,
                    attrArray1[1].id,
                    attrArray1[1].workspace.id,
                    attrArray2[0].id,
                    attrArray2[1].id,
                    attrArray2[1].workspace.id
                ];

                _.each(ids, function(id) {
                    expect(id).toBeA("string");
                });
                expect(_.uniq(ids).length).toBe(6);
            });
        });
    });

    describe("#safeExtend", function() {
        var result, original;

        beforeEach(function() {
            original = {
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
            it("returns the original", function() {
                var result = newFixtures.safeExtend(original, undefined);
                expect(result).toEqual(original);
            });
        });

        context("when a property is overriden", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(original, { foo: "pizza" });
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
                        newFixtures.safeExtend(original, { whippedCream: "lots" }, "user");
                    }).toThrow("The fixture 'user' has no key 'whippedCream'");
                });
            });
        });

        context("when overriding a key in a nested object", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(original, {
                    nestedObject: {
                        name: "pizza"
                    }
                });
            });

            it("does not mutate the original object", function() {
                expect(original.nestedObject).toEqual({
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
                        newFixtures.safeExtend(original, { nestedObject: { hamburger: "double" }}, "user")
                    }).toThrow("The fixture 'user.nestedObject' has no key 'hamburger'");
                });
            });

            it("does not allow keys that aren't present in the nested object", function() {
            });
        });

        context("when overriding a value in a nested array", function() {
            beforeEach(function() {
                result = newFixtures.safeExtend(original, {
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
            context("when the override array is shorter than the original array", function() {
                beforeEach(function() {
                    result = newFixtures.safeExtend(original, {
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

                it("returns an array the same length as the override array", function() {
                    expect(result.nestedObjectArray.length).toBe(1);
                });
            });

            context("when the override array is longer than the original array", function() {
                beforeEach(function() {
                    result = newFixtures.safeExtend(original, {
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
