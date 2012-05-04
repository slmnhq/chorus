describe("chorus.models.Abstract", function() {
    describe("Base", function() {
        beforeEach(function() {
            this.model = new chorus.models.Base({ id: "foo"});
            this.model.urlTemplate = "my_items/{{id}}";
        });

        describe("#url", function() {
            context("when the model's urlTemplate is a function", function() {
                beforeEach(function() {
                    this.model.urlTemplate = function() {
                        return "my_other_items/{{id}}"
                    };
                });

                it("uses the function's return value", function() {
                    expect(this.model.url()).toMatchUrl("/my_other_items/foo");
                });

                it("passes any options to the urlTemplate function", function() {
                    spyOn(this.model, 'urlTemplate').andReturn("foo");
                    this.model.url({ method: 'create' });
                    expect(this.model.urlTemplate).toHaveBeenCalledWith({ method: 'create' });
                });
            });

            it("compiles the urlTemplate and renders it with model attributes", function() {
                expect(this.model.url()).toMatchUrl("/my_items/foo");
            });

            it("compiles the urlTemplate with the model's entityId and entityType", function() {
                this.model.entityId = "45";
                this.model.urlTemplate = "data/{{entityId}}"
                expect(this.model.url()).toBe("/data/45");
            });

            it("does not unescape %2b to +, or otherwise bypass escaping", function() {
                this.model.entityId = "+";
                this.model.urlTemplate = "data/{{encode entityId}}"
                expect(this.model.url()).toBe("/data/%2B");
            });

            context("when the model has a urlTemplateAttributes function", function() {
                beforeEach(function() {
                    this.model.urlTemplate = "data/{{param1}}/{{param2}}/baz"
                    this.model.urlTemplateAttributes = function() {
                        return {
                            param1: "foo",
                            param2: "bar"
                        }
                    }
                });

                it("should use the urlTemplateAttributes to construct the url", function() {
                    expect(this.model.url()).toBe("/data/foo/bar/baz");
                });
            });

            context("when the model has additional url params", function() {
                context("when the urlParams is a function", function() {
                    beforeEach(function() {
                        this.model.urlParams = function() {
                            return { dance: "the thizzle" };
                        };
                    });

                    it("passes any options to the urlParams function", function() {
                        spyOn(this.model, 'urlParams').andCallThrough();
                        this.model.url({ method: 'create' });
                        expect(this.model.urlParams).toHaveBeenCalledWith({ method: 'create' });
                    });
                });

                context("when the url params are a property", function() {
                    beforeEach(function() {
                        this.model.urlParams = { dance: "the thizzle" }
                    });

                    it("url-encodes the params and appends them to the url", function() {
                        expect(this.model.url()).toMatchUrl("/my_items/foo?dance=the+thizzle");
                    });

                    context("when the base url template includes a query string", function() {
                        beforeEach(function() {
                            this.model.urlTemplate = "my_items/{{id}}?size=medium";
                        });

                        it("merges the query strings properly", function() {
                            expect(this.model.url()).toMatchUrl("/my_items/foo?dance=the+thizzle&size=medium");
                        });
                    });
                });
            });
        });

        describe("activities", function() {
            it("throws when the model does not have an entityType", function() {
                try {
                    this.models.activities();
                    expect('never').toBe('here');
                } catch (e) {
                    // test passed
                }
            });

            context("with an entityType", function() {
                beforeEach(function() {
                    this.model.entityType = "some_entity";
                    this.model.set({id: "1"});
                    this.activitySet = this.model.activities();
                });

                it("has the right 'entityType' and 'entityId'", function() {
                    expect(this.activitySet.attributes.entityType).toBe("some_entity");
                    expect(this.activitySet.attributes.entityId).toBe("1");
                });

                it("returns the same activities object over each call", function() {
                    expect(this.model.activities()).toBe(this.activitySet);
                });

                it("accepts an override for the entityType", function() {
                    this.activitySet = this.model.activities("myType");
                    expect(this.activitySet.attributes.entityType).toBe("myType");
                });

                it("does not return the same activities if the effective entityType is different", function() {
                    expect(this.model.activities("myType")).not.toBe(this.model.activities());
                })

                context("when a model specifies an entityId", function() {
                    beforeEach(function() {
                        delete this.model._activities;
                        this.model.entityId = "100";
                        this.activitySet = this.model.activities();
                    });

                    it("has the right 'entityType' and 'entityId'", function() {
                        expect(this.activitySet.attributes.entityType).toBe("some_entity");
                        expect(this.activitySet.attributes.entityId).toBe("100");
                    });

                    it("returns the same activities object over each call", function() {
                        expect(this.model.activities()).toBe(this.activitySet);
                    });

                });

                describe("when the model is invalidated", function() {
                    beforeEach(function() {
                        this.model.trigger("invalidated");
                    });

                    it("fetches the activities", function() {
                        expect(_.last(this.server.requests).url).toBe(this.activitySet.url());
                    });
                });

            });
        });

        describe("#isValid", function() {
            it("returns true when the errors hash is empty", function() {
                this.model.errors = {'foo': "your foo is dumb"};
                expect(this.model.isValid()).toBeFalsy();
            });

            it("returns true when the errors hash is not empty", function() {
                this.model.errors = {};
                expect(this.model.isValid()).toBeTruthy();
            });

            it("returns true when the errors hash is falsy", function() {
                this.model.errors = undefined;
                expect(this.model.isValid()).toBeTruthy();
            });
        });

        describe("#save", function() {
            describe("with valid model data", function() {
                beforeEach(function() {
                    this.validatedSpy = jasmine.createSpy();
                    this.model.bind("validated", this.validatedSpy);
                    this.model.save();
                    this.savedSpy = jasmine.createSpy();
                    this.saveFailedSpy = jasmine.createSpy();
                    this.model.bind("saved", this.savedSpy);
                    this.model.bind("saveFailed", this.saveFailedSpy);
                });

                it("triggers the validated event", function() {
                    expect(this.validatedSpy).toHaveBeenCalled();
                });

                describe("when the request succeeds", function() {
                    beforeEach(function() {
                        this.server.lastUpdate().succeed({foo: "hi"});
                    });

                    it("triggers a saved event", function() {
                        expect(this.savedSpy).toHaveBeenCalled();
                    });
                });

                describe("when the request fails", function() {
                    beforeEach(function() {
                        this.errors = { fields: { a: { BLANK: {} } } };

                        this.server.lastUpdate().failUnprocessableEntity(this.errors, {
                            foo: "bar"
                        });
                    });

                    it("returns the error information", function() {
                        expect(this.model.serverErrors).toEqual(this.errors);
                    });

                    it("triggers a saveFailed event", function() {
                        expect(this.saveFailedSpy).toHaveBeenCalled();
                        var args = this.saveFailedSpy.mostRecentCall.args;
                        expect(args[0]).toBe(this.model);
                        expect(args[1].response).toEqual({
                            foo: "bar"
                        });
                    });

                    describe("and then another request succeeds", function() {
                        beforeEach(function() {
                            this.model.save();
                            this.server.lastUpdate().succeed({foo: "hi"});
                        });

                        it("should trigger the saved event", function() {
                            expect(this.savedSpy).toHaveBeenCalled();
                        });

                        it("clears the error information", function() {
                            expect(this.model.serverErrors).toBeUndefined();
                        });
                    });
                });
            });

            describe("when the model is invalid", function() {
                beforeEach(function() {
                    this.model.performValidation = function() {
                        return false;
                    }
                    this.savedSpy = jasmine.createSpy();
                    this.model.bind("saved", this.savedSpy);
                    this.validationFailedSpy = jasmine.createSpy();
                    this.model.bind("validationFailed", this.validationFailedSpy);
                    spyOn(Backbone.Model.prototype, "save");
                })

                it("returns false", function() {
                    expect(this.model.save()).toBeFalsy();
                })

                it("does not save the object", function() {
                    this.model.save();
                    expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                })

                it("triggers validationFailed", function() {
                    this.model.save();
                    expect(this.validationFailedSpy).toHaveBeenCalled();
                })
            })

            context("when attributes are passed to the save method", function() {
                beforeEach(function() {
                    this.model.declareValidations = function(newAttrs) {
                        this.require('requiredAttr', newAttrs);
                    };

                    this.model.set({requiredAttr: 'foo'});
                    this.validationFailedSpy = jasmine.createSpy();
                    this.model.bind("validationFailed", this.validationFailedSpy);
                    this.validatedSpy = jasmine.createSpy();
                    this.model.bind("validated", this.validatedSpy);
                    spyOn(Backbone.Model.prototype, "save");
                });

                context("when the attrs are valid", function() {
                    beforeEach(function() {
                        this.model.save({requiredAttr: "bar"})
                    });

                    it("saves the model", function() {
                        expect(Backbone.Model.prototype.save).toHaveBeenCalled();
                    });

                    it("triggers validated", function() {
                        expect(this.validatedSpy).toHaveBeenCalled();
                    });

                    describe("and beforeSave makes a change to the attrs", function() {
                        beforeEach(function() {
                            spyOn(this.model, "beforeSave").andCallFake(function(attrs, options) {
                                attrs.otherAttr = "foo"
                            })

                            Backbone.Model.prototype.save.reset();
                            this.model.save({ requiredAttr: "bar" })
                        })

                        it("saves the changed attrs", function() {
                            expect(Backbone.Model.prototype.save).toHaveBeenCalledWith({
                                requiredAttr: "bar",
                                otherAttr: "foo"
                            }, jasmine.any(Object));
                        })
                    })

                    describe("and beforeSave does not make any changes to the attrs", function() {
                        it("saves the unchanged attrs", function() {
                            expect(Backbone.Model.prototype.save).toHaveBeenCalledWith(
                                { requiredAttr: "bar" }, jasmine.any(Object));
                        })
                    })
                });

                context("when the attrs are invalid", function() {
                    beforeEach(function() {
                        this.model.save({requiredAttr: ""})
                    });

                    it("does not save the model", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    })

                    it("triggers validationFailed", function() {
                        expect(this.validationFailedSpy).toHaveBeenCalled();
                    })
                });
            });

            context("when no attributes are passed to the save method", function() {
                beforeEach(function() {
                    this.model.set({requiredAttr: 'foo'});
                    spyOn(Backbone.Model.prototype, "save");
                });

                describe("and beforeSave makes a change to the attrs", function() {
                    beforeEach(function() {
                        spyOn(this.model, "beforeSave").andCallFake(function(attrs, options) {
                            attrs.otherAttr = "foo"
                        })

                        this.model.save()
                    })

                    it("saves the changed attrs", function() {
                        expect(Backbone.Model.prototype.save).toHaveBeenCalledWith({
                            otherAttr: "foo"
                        }, jasmine.any(Object));
                    })
                })

                describe("and beforeSave does not make any changes to the attrs", function() {
                    beforeEach(function() {
                        this.model.save();
                    })

                    it("saves the unchanged attrs", function() {
                        expect(Backbone.Model.prototype.save).toHaveBeenCalledWith(undefined, jasmine.any(Object));
                    })
                })
            })

            it("calls the 'beforeSave' hook", function() {
                spyOn(this.model, 'beforeSave')
                var attrs = {foo: 'bar'}
                this.model.save(attrs, { silent: true });

                expect(this.model.beforeSave).toHaveBeenCalled();
                var beforeSaveArgs = this.model.beforeSave.calls[0].args;
                expect(beforeSaveArgs[0]).toEqual(attrs);

                // the options hash gets mutated later in #save
                expect(beforeSaveArgs[1].silent).toBeTruthy();
            });
        });

        describe("#destroy", function() {
            beforeEach(function() {
                this.destroySpy = jasmine.createSpy();
                this.destroyFailedSpy = jasmine.createSpy();
                this.model.bind("destroy", this.destroySpy);
                this.model.bind("destroyFailed", this.destroyFailedSpy);
                this.model.destroy();
            });

            describe("when the request succeeds", function() {
                beforeEach(function() {
                    this.server.lastDestroy().succeed();
                });

                it("triggers a destroy event", function() {
                    expect(this.destroySpy).toHaveBeenCalled();
                })

                it("does not trigger a destroyFailed event", function() {
                    expect(this.destroyFailedSpy).not.toHaveBeenCalled();
                })
            });

            describe("when the request fails", function() {
                beforeEach(function() {
                    this.server.lastDestroy().failUnprocessableEntity({ record: "not_found"});
                });

                it("triggers a destroyFailed event", function() {
                    expect(this.destroyFailedSpy).toHaveBeenCalled();
                })

                it("does not trigger a destroy event", function() {
                    expect(this.destroySpy).not.toHaveBeenCalled();
                })

                it("returns the error information", function() {
                    expect(this.model.serverErrors).toEqual({ record: "not_found" });
                });
            });
        })

        describe("#isDeleted", function() {
            it("is true when the isDeleted attribute is equal to 'true'", function() {
                this.model.set({isDeleted: 'true'});
                expect(this.model.isDeleted()).toBeTruthy();
            });

            it("is true when the isDeleted attribute is equal to true", function() {
                this.model.set({isDeleted: true});
                expect(this.model.isDeleted()).toBeTruthy();
            });

            it("is false when the isDeleted attribute is equal to any other string", function() {
                this.model.set({isDeleted: 'any other string'});
                expect(this.model.isDeleted()).toBeFalsy();
            });

            it("is false when the isDeleted attribute is equal to false", function() {
                this.model.set({isDeleted: false});
                expect(this.model.isDeleted()).toBeFalsy();
            });

            it("is false when the isDeleted attribute is missing", function() {
                expect(this.model.isDeleted()).toBeFalsy();
            });
        });

        describe("before parsing", function() {
            it("is not loaded", function() {
                expect(this.model.loaded).toBeFalsy();
            });
        });

        describe("#parse", function() {
            beforeEach(function() {
                this.thing = { hi: "there" };
            })

            it("returns the enclosed resource", function() {
                expect(this.model.parse({
                    status: "ok",
                    foo: "bar",
                    response: this.thing
                }, {
                    status: 200
                })).toBe(this.thing);
            });
        });

        describe("#require", function() {
            beforeEach(function() {
                this.model.errors = {};
            })

            it("sets an error if the attribute isn't present", function() {
                this.model.require("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.require("foo");
                expect(this.model.errors.foo).toBe("nope");
            })

            it("sets an error if the attribute is present, is a String, and contains only whitespace", function() {
                this.model.set({ foo: "    " })
                this.model.require("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not set an error if the attribute is present", function() {
                this.model.set({ foo: "bar" });
                this.model.require("foo");
                expect(this.model.errors.foo).not.toBeDefined();
            })

            it("contains the attr name", function() {
                this.model.require("foo");
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar"});
                this.model.require("foo", {foo: ""});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "bar"});
                this.model.require("foo", {foo: "quux"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("uses a custom error message, if provided", function() {
                this.model.require("foo", {foo: ""}, "test.mouse");
                expect(this.model.errors.foo).toMatchTranslation("test.mouse")
            })


            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo": "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.require("foo");
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        })

        describe("requirePattern", function() {
            beforeEach(function() {
                this.model.errors = {};
            })

            it("sets an error if the attribute isn't present", function() {
                this.model.requirePattern("foo");
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.requirePattern("foo");
                expect(this.model.errors.foo).toBe("nope");
            })
            it("sets an error if the attribute is present but doesn't match the pattern", function() {
                this.model.set({ foo: "bar" });
                this.model.requirePattern("foo", /baz/);
                expect(this.model.errors.foo).toBeDefined();
            })

            it("does not set an error if the attribute is present and matches the pattern", function() {
                this.model.set({ foo: "bar" }, { silent: true });
                this.model.requirePattern("foo", /bar/);
                expect(this.model.errors.foo).not.toBeDefined();
            })

            it("contains the attr name in the error", function() {
                this.model.requirePattern("foo", /hello/);
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar"});
                this.model.requirePattern("foo", /bar/, {foo: ""});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "123"});
                this.model.requirePattern("foo", /\d+/, {foo: "456"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("uses a custom error message, if provided", function() {
                this.model.requirePattern("foo", /hello/, {}, "test.mouse");
                expect(this.model.errors.foo).toMatchTranslation("test.mouse")
            })

            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo": "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.require("foo", /hello/);
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        });

        describe("requireConfirmation", function() {
            beforeEach(function() {
                this.model.errors = {};
            });

            it("sets an error if the attribute isn't present", function() {
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBe("nope");
            })

            it("sets an error if the confirmation isn't present", function() {
                this.model.set({ foo: "bar" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("sets an error if the confirmation doesn't match the attribute", function() {
                this.model.set({ foo: "bar", fooConfirmation: "baz" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the confirmation matches the attribute", function() {
                this.model.set({ foo: "bar", fooConfirmation: "bar" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("contains the attr name in the error", function() {
                this.model.set({ foo: "bar", fooConfirmation: "baz" });
                this.model.requireConfirmation("foo");
                expect(this.model.errors.foo).toContain("foo");
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: "bar", fooConfirmation: "bar"});
                this.model.requireConfirmation("foo", {foo: "a", fooConfirmation: "b"});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "123", fooConfirmation: "123"});
                this.model.requireConfirmation("foo", {foo: "456", fooConfirmation: "456"});

                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("throws if newAttrs supplies an original and not a confirmation", function() {
                this.model.set({foo: "123", fooConfirmation: "123"});

                try {
                    this.model.requireConfirmation("foo", {foo: "456"});
                    expect("should never get here").toBe("wtf");
                } catch (e) {
                    // test passed
                }
            });

            it("uses a custom error message, if provided", function() {
                this.model.set({foo: "bar", fooConfirmation: "bar"});
                this.model.requireConfirmation("foo", {foo: "a", fooConfirmation: "b"}, "test.mouse");
                expect(this.model.errors.foo).toMatchTranslation("test.mouse")
            })

            context("model has attrToLabel set", function() {
                beforeEach(function() {
                    this.model.attrToLabel = {
                        "foo": "users.first_name"
                    }
                });

                it("includes the translation in the error message", function() {
                    this.model.set({ foo: "bar", fooConfirmation: "baz" });
                    this.model.requireConfirmation("foo");
                    expect(this.model.errors.foo).toContain(t("users.first_name"));
                });
            });
        });

        describe("requireIntegerRange", function() {
            beforeEach(function() {
                this.model.errors = {};
            });

            it("sets an error if the attribute isn't present", function() {
                this.model.requireIntegerRange("foo", 5, 10);
                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not clobber a previously-existing error", function() {
                this.model.errors["foo"] = "nope";
                this.model.requireIntegerRange("foo", 5, 10);
                expect(this.model.errors.foo).toBe("nope");
            })

            it("sets an error if the attribute is present but less than the range minimum", function() {
                this.model.set({ foo: 1});
                this.model.requireIntegerRange("foo", 5, 10);
                expect(this.model.errors.foo).toBeDefined();
            });

            it("sets an error if the attribute is present but greater than the range maximum", function() {
                this.model.set({ foo: 11});
                this.model.requireIntegerRange("foo", 5, 10);
                expect(this.model.errors.foo).toBeDefined();
            });

            it("sets an error if newAttrs is invalid but the existing value is valid", function() {
                this.model.set({foo: 6});
                this.model.requireIntegerRange("foo", 5, 10, {foo: "12"});

                expect(this.model.errors.foo).toBeDefined();
            });

            it("does not set an error if the newAttrs is valid", function() {
                this.model.set({foo: "bar"});
                this.model.requireIntegerRange("foo", 5, 10, {foo: 8});
                expect(this.model.errors.foo).not.toBeDefined();
            });

            it("uses a custom error message, if provided", function() {
                this.model.set({ foo: 11});
                this.model.requireIntegerRange("foo", 5, 10, {}, "test.mouse");
                expect(this.model.errors.foo).toMatchTranslation("test.mouse")
            })
        });

        describe("hasOwnPage", function() {
            it("returns false", function() {
                var model = new chorus.models.Base()
                expect(model.hasOwnPage()).toBeFalsy();
            })
        })

        describe("highlightedAttribute", function() {
            beforeEach(function() {
                this.model.set({
                    highlightedAttributes: {
                        name: '<em>foo</em>',
                        otherThing: [
                            '<em>flarp</em>'
                        ]
                    },
                    name: 'foo',
                    title: 'foop',
                    trouble: '<script>evilFunction()</script>bye'
                });
            });

            it("returns the highlighted attribute", function() {
                expect(this.model.highlightedAttribute('name')).toBe('<em>foo</em>');
            });

            it("returns the first highlighted attribute when it is an array", function() {
                expect(this.model.highlightedAttribute('otherThing')).toBe('<em>flarp</em>');
            });

            it("does not return the regular attribute if no highlighted one exists", function() {
                expect(this.model.highlightedAttribute('title')).toBeUndefined();
            });
        });

        describe("#name", function() {
            context("when the model has a nameAttribute set", function() {
                beforeEach(function() {
                    this.model.set({iAmAName: 'jerry'});
                    this.model.nameAttribute = 'iAmAName';
                });

                it("returns that attribute", function() {
                    expect(this.model.name()).toBe('jerry');
                });
            });

            context("when the model has a nameFunction set", function() {
                beforeEach(function() {
                    this.model.set({fName: 'herbert', lName: 'humphrey'});
                    this.model.iAmANameFunction = function() {
                        return this.get("fName") + ' ' + this.get("lName");
                    };
                    this.model.nameFunction = 'iAmANameFunction';
                });

                it("returns the result of that function", function() {
                    expect(this.model.name()).toBe('herbert humphrey');
                });
            });

            context("when the model doesn't have a nameAttribute or nameFunction", function() {
                beforeEach(function() {
                    delete this.model.nameAttribute;
                    delete this.model.nameFunction;
                    this.model.set({name: "Mark"});
                });
                it("returns the name attribute", function() {
                    expect(this.model.name()).toBe("Mark");
                });
            });
        });

        describe("highlightedName", function() {
            context("when the model has a nameAttribute set", function() {
                beforeEach(function() {
                    this.model.set({
                        iAmAName: '<script>evilFunction("hi!")</script>jerry',
                        highlightedAttributes: {
                            iAmAName: '<em>jerry</em>'
                        }
                    });
                    this.model.nameAttribute = 'iAmAName';
                });

                it("returns the highlighted attribute", function() {
                    expect(this.model.highlightedName().toString()).toBe('<em>jerry</em>');
                    expect(this.model.highlightedName()).toBeA(Handlebars.SafeString);
                });

                it("returns the regular attribute when the highlighted one does not exist", function() {
                    delete this.model.get('highlightedAttributes').iAmAName;
                    expect(this.model.highlightedName().toString()).toBe('&lt;script&gt;evilFunction(&quot;hi!&quot;)&lt;/script&gt;jerry');
                    expect(this.model.highlightedName()).toBeA(Handlebars.SafeString);
                });
            });

            context("when the model has a nameFunction set", function() {
                beforeEach(function() {
                    this.model.set({
                        fName: '<script>evilFunction("hi!")</script>herbert',
                        lName: 'humphrey',
                        highlightedAttributes: {
                            fName: '<em>herbert</em>'
                        }
                    });
                    this.model.iAmANameFunction = function() {
                        return this.get("fName") + ' ' + this.get("lName");
                    };
                    this.model.nameFunction = 'iAmANameFunction';
                });

                it("returns the function with highlighted results", function() {
                    expect(this.model.highlightedName().toString()).toBe('<em>herbert</em> humphrey');
                    expect(this.model.highlightedName()).toBeA(Handlebars.SafeString);
                });

                it("returns the function with regular attribute when the highlighted ones do not exist", function() {
                    delete this.model.get('highlightedAttributes').fName;
                    expect(this.model.highlightedName().toString()).toBe('&lt;script&gt;evilFunction(&quot;hi!&quot;)&lt;/script&gt;herbert humphrey');
                    expect(this.model.highlightedName()).toBeA(Handlebars.SafeString);
                });
            });
        });

        describe("#toJSON", function() {
            beforeEach(function() {
                this.model.set({
                    "name": "Lenny"
                });
            });

            context("when parameterWrapper is not defined", function() {
                context("and constructorName is defined", function() {
                    beforeEach(function() {
                        this.model.constructorName = "FlimFlam";
                    });

                    it("scopes the attributes under the lowercased constructorName", function() {
                        var params = this.model.toJSON();
                        expect(params.flimflam).toBeDefined();
                        expect(params.flimflam.name).toBe("Lenny");
                    });
                });

                context("and constructorName is not defined", function() {
                    it("uses the base toJSON method", function() {
                        expect(this.model.toJSON()).toEqual(this.model.attributes);
                    });
                });
            });

            context("when parameterWrapper is defined", function() {
                beforeEach(function() {
                    this.model.parameterWrapper = "foo";
                });

                it("scopes the attributes under the parameterWrapper key", function() {
                    var params = this.model.toJSON();
                    expect(params.foo).toBeDefined();
                    expect(params.foo.name).toBe("Lenny");
                });
            });
        });
    });

    describe("Collection", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.Base([], { foo: "bar" });
            this.collection.urlTemplate = "bar/{{encode foo}}";
        });

        describe("#url", function() {
            context("when the collection has pagination information from the server", function() {
                beforeEach(function() {
                    this.collection.pagination = {
                        page: '4',
                        total: '5',
                        records: '250'
                    };
                });

                it("fetches the corresponding page of the collection", function() {
                    expect(this.collection.url()).toBe("/bar/bar?page=1&rows=50");
                });
            });

            context("when the urlTemplate is a function", function() {
                beforeEach(function() {
                    this.collection.urlTemplate = function() {
                        return "my_other_items/{{foo}}"
                    };
                });

                it("uses the function's return value", function() {
                    expect(this.collection.url()).toContain("/my_other_items/bar");
                });

                it("passes any options to the urlTemplate function", function() {
                    spyOn(this.collection, 'urlTemplate').andReturn("foo");
                    this.collection.url({ method: 'create' });
                    expect(this.collection.urlTemplate).toHaveBeenCalledWith({rows: 50, page: 1, method: 'create'});
                });
            });

            context("when the collection has NO pagination or page property", function() {
                it("fetches the first page of the collection", function() {
                    expect(this.collection.url()).toBe("/bar/bar?page=1&rows=50");
                });
            });

            it("does not unescape %2b to +, or otherwise bypass escaping", function() {
                this.collection.attributes.foo = "+";
                expect(this.collection.url()).toBe("/bar/%2B?page=1&rows=50");
            });

            it("takes an optional page size", function() {
                expect(this.collection.url({ rows: 1000 })).toBe("/bar/bar?page=1&rows=1000");
            });

            it("takes an optional page number", function() {
                expect(this.collection.url({ page: 4 })).toBe("/bar/bar?page=4&rows=50");
            });

            it("mixes in order from collection ascending", function() {
                this.collection.sortAsc("foo");
                expect(this.collection.url()).toBe("/bar/bar?page=1&rows=50&order=foo")
            });

            it("plays nicely with existing parameters in the url template", function() {
                this.collection.urlTemplate = "bar/{{foo}}?why=not";
                expect(this.collection.url()).toBe("/bar/bar?why=not&page=1&rows=50");
            })
        });

        describe("before parsing", function() {
            it("is not loaded", function() {
                expect(this.collection.loaded).toBeFalsy();
            })
        })

        describe("#parse", function() {
            beforeEach(function() {
                this.things = [
                    { hi: "there" },
                    { go: "away" }
                ];
            });

            it("stores pagination info on the collection", function() {
                var pagination = {
                    total: "2",
                    page: "1",
                    records: "52"
                }

                this.collection.parse({ response: this.things, pagination: pagination });
                expect(this.collection.pagination).toBe(pagination);
            });

            it("returns the enclosed resource", function() {
                expect(this.collection.parse({ response: this.things, status: 'ok'})).toEqual(this.things);
            });
        });

        describe("#findWhere", function() {
            beforeEach(function() {
                this.m1 = newFixtures.user({ first_name: "john", last_name: "coltrane", id: "5", admin: false });
                this.m2 = newFixtures.user({ first_name: "ravi", last_name: "coltrane", id: "6", admin: true });
                this.m3 = newFixtures.user({ first_name: "john", last_name: "medeski", id: "7", admin: true  });
                this.collection.reset([ this.m1, this.m2, this.m3 ]);
            });

            context("when a model with the given attributes exists in the collection", function() {
                it("returns that model", function() {
                    expect(this.collection.findWhere({ first_name: "john", last_name: "coltrane" })).toBe(this.m1);
                    expect(this.collection.findWhere({ first_name: "john", admin: false })).toBe(this.m1);
                    expect(this.collection.findWhere({ last_name: "coltrane", admin: true })).toBe(this.m2);
                    expect(this.collection.findWhere({ first_name: "john", admin: true })).toBe(this.m3);
                    expect(this.collection.findWhere({ last_name: "medeski" })).toBe(this.m3);
                });
            });

            context("when no model with the given attributes exists in the collection", function() {
                it("returns undefined", function() {
                    expect(this.collection.findWhere({ first_name: "ravi", last_name: "medeski" })).toBeUndefined();
                });
            });
        });

        describe("#fetchAll", function() {
            beforeEach(function() {
                this.collection.fetchAll();
            });

            it("requests page one from the server", function() {
                expect(this.server.requests[0].url).toBe("/bar/bar?page=1&rows=1000");
            });

            describe("and the server responds successfully", function() {
                beforeEach(function() {
                    var self = this;

                    this.resetListener = jasmine.createSpy("reset");
                    this.resetListener.andCallFake(function(collection) {
                        self.collectionLengthOnReset = collection.length;
                    });
                    this.collection.bind("reset", this.resetListener)

                    this.loadedListener = jasmine.createSpy("loaded");
                    this.loadedListener.andCallFake(function() {
                        self.collectionLengthOnLoaded = this.length;
                    });
                    this.collection.bind("loaded", this.loadedListener)

                    this.server.fetches()[0].succeed([
                        { foo: "hi" },
                        { foo: "there" }
                    ],
                        {
                            "total": "2",
                            "page": "1",
                            "records": "3"
                        }
                    );

                    this.server.fetches()[1].succeed([
                        { foo: "hi" },
                        { foo: "there" }
                    ],
                        {
                            "total": "2",
                            "page": "2",
                            "records": "3"
                        }
                    );
                });

                it("requests subsequent pages", function() {
                    expect(this.server.requests[1].url).toBe("/bar/bar?page=2&rows=1000");
                });

                it("triggers the reset event once", function() {
                    expect(this.resetListener.callCount).toBe(1)
                });

                it("triggers the reset event after all models are in the collection", function() {
                    expect(this.collectionLengthOnReset).toBe(4)
                });

                it("triggers the loaded event once", function() {
                    expect(this.loadedListener.callCount).toBe(1)
                });

                it("triggers the loaded event after all models are in the collection", function() {
                    expect(this.collectionLengthOnLoaded).toBe(4)
                })
            })

            describe("and the server responds with an error", function() {
                beforeEach(function() {
                    var self = this;

                    this.resetListener = function(collection) {
                        self.collectionLengthOnReset = collection.length;
                    }
                    this.collection.bind("reset", this.resetListener)

                    this.server.fetches()[0].succeed([
                        { foo: "hi" },
                        { foo: "there" }
                    ],
                        {
                            "total": "2",
                            "page": "1",
                            "records": "3"
                        }
                    )

                    this.server.fetches()[1].failUnprocessableEntity()
                })

                it("requests subsequent pages", function() {
                    expect(this.server.requests[1].url).toBe("/bar/bar?page=2&rows=1000");
                })

                it("triggers the reset event when the error occurs", function() {
                    expect(this.collectionLengthOnReset).toBe(2)
                })
            })
        })

        describe("#fetchPage", function() {
            it("requests page one from the server", function() {
                this.collection.fetchPage(2);
                expect(this.server.requests[0].url).toBe("/bar/bar?page=2&rows=50");
            })

            it("passes options through to fetch", function() {
                spyOn(this.collection, "fetch");
                this.collection.fetchPage(2, { foo: "bar" })
                var options = this.collection.fetch.mostRecentCall.args[0];
                expect(options.foo).toBe("bar");
            })

            it("does not affect subsequent calls to fetch", function() {
                this.collection.fetchPage(2);
                this.collection.fetch();
                expect(this.server.requests[1].url).toBe("/bar/bar?page=1&rows=50");
            })

            context("when the 'rows' option is passed", function() {
                it("fetches the given number of rows", function() {
                    this.collection.fetchPage(2, { rows: 13 });
                    expect(this.server.lastFetch().url).toBe("/bar/bar?page=2&rows=13");
                });

                it("does not pass the 'rows' option through to Backbone.Collection#fetch", function() {
                    spyOn(this.collection, "fetch");
                    this.collection.fetchPage(2, { rows: 13 });
                    var options = this.collection.fetch.mostRecentCall.args[0];
                    expect(options.rows).toBeUndefined();
                });

                it("stores the number of rows, and fetches number next time", function() {
                    this.collection.fetchPage(2, { rows: 13 });
                    this.collection.fetchPage(3);
                    expect(this.server.lastFetch().url).toBe("/bar/bar?page=3&rows=13");

                    this.collection.fetch();
                    expect(this.server.lastFetch().url).toContainQueryParams({ rows: 13 });
                });
            });
        })

        describe("LastFetchWins", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.LastFetchWins([], { foo: "bar" });
                this.collection.urlTemplate = "lifo/{{foo}}";
            });
            it("ignores values returned by previous fetches", function() {
                var foo = {x: 0};
                this.collection.fetch({success: _.bind(function() {
                    this.x = 1;
                }, foo)});
                var fetch1 = this.server.lastFetchFor(this.collection);

                this.collection.fetch({success: _.bind(function() {
                    this.x = 2;
                }, foo)});
                var fetch2 = this.server.lastFetchFor(this.collection);

                expect(foo.x).toBe(0);

                fetch2.succeed([], {});
                expect(foo.x).toBe(2);

                fetch1.succeed([], {});
                expect(foo.x).toBe(2);

                this.collection.fetch({success: _.bind(function() {
                    this.x = 3;
                }, foo)});
                var fetch3 = this.server.lastFetchFor(this.collection);

                fetch3.succeed([], {});
                expect(foo.x).toBe(3);
            });
        });
    });
});

