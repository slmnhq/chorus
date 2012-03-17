describe("backbone_extensions", function() {
    describe("sync", function() {
        beforeEach(function() {
            spyOn($, "ajax").andCallThrough();
            this.model = new chorus.models.Base();
            this.model.urlTemplate = "my_items/{{id}}";
        })

        it("passes the method to the model's url method", function() {
            spyOn(this.model, 'url').andReturn("foo");
            this.model.save();
            expect(this.model.url).toHaveBeenCalledWith({ method: 'create' });

            this.model.url.reset();
            this.model.fetch();
            expect(this.model.url).toHaveBeenCalledWith({ method: 'read' });

            this.model.url.reset();
            this.model.id = '24';
            this.model.save();
            expect(this.model.url).toHaveBeenCalledWith({ method: 'update' });
        });

        it("allows method override through options", function() {
            expect(this.server.lastCreate()).toBeUndefined();
            this.model.save();
            expect(this.server.lastCreate().method).toBe("POST");

            expect(this.server.lastUpdate()).toBeUndefined();
            this.model.save({}, { method : 'update' });
            expect(this.server.lastUpdate().method).toBe("PUT");
        })
        
        context("with a non-file upload model", function() {
            describe("#save", function() {
                it("uses AJAX", function() {
                    this.model.save();
                    expect($.ajax).toHaveBeenCalled();
                })
            })
        })

        context("with a file upload model", function() {
            beforeEach(function() {
                this.uploadDeferred = new $.Deferred();
                this.uploadPromise = this.uploadDeferred.promise();

                var input = $("<input/>").attr("type", "file").data("fileupload", { options: {}});
                this.uploadSpy = {
                    submit: jasmine.createSpy("submit").andReturn(this.uploadPromise),
                    form: $("<form></form>").append(input)[0]
                };
                this.model.uploadObj = this.uploadSpy;
            });

            context("with a new object", function() {
                beforeEach(function() {
                    this.uploadedSpy = jasmine.createSpy();
                    this.uploadFailedSpy = jasmine.createSpy();
                    this.model.bind("uploaded", this.uploadedSpy);
                    this.model.bind("uploadFailed", this.uploadFailedSpy);
                    this.model.save({ name: "Enrique" });
                });

                it("does not use AJAX", function() {
                    expect($.ajax).not.toHaveBeenCalled();
                });

                it("submits the upload object", function() {
                    expect(this.uploadSpy.submit).toHaveBeenCalled();
                });
            });

            context("with an existing object", function() {
                beforeEach(function() {
                    this.model.set({id: '123'})
                    this.model.save();
                });

                it("uses AJAX", function() {
                    expect($.ajax).toHaveBeenCalled();
                });
            });
        });
    });

    describe("super", function() {
        var child, parent, grandParent;
        var childClass, parentClass, grandParentClass;
        beforeEach(function() {
            grandParentClass = Backbone.Model.extend({
                testFunction: function() {
                    return 'grandParent';
                }
            });
            parentClass = grandParentClass.extend({
                testFunction: function() {
                    return 'parent';
                }
            });
            childClass = parentClass.extend({
                testFunction: function(arg1, arg2) {
                    return this._super('testFunction', arguments);
                }
            });
            spyOn(grandParentClass.prototype, 'testFunction').andCallThrough();
            spyOn(parentClass.prototype, 'testFunction').andCallThrough();
            spyOn(childClass.prototype, 'testFunction').andCallThrough();
            child = new childClass({name: 'child'});
            parent = new parentClass({name: 'parent'});
            grandParent = new grandParentClass({name: 'grandparent'});
        });

        describe("when the child calls super parent", function() {
            it("the parent should get called", function() {
                expect(child.testFunction()).toEqual('parent');
                expect(parentClass.prototype.testFunction.callCount).toEqual(1);
                expect(grandParentClass.prototype.testFunction.callCount).toEqual(0);
            });

            it("works if the method is called more than once", function() {
                expect(child.testFunction()).toEqual('parent');
                expect(child.testFunction()).toEqual('parent');
                expect(parentClass.prototype.testFunction.callCount).toEqual(2);
            });

            describe("when it calls through to the grandParent", function() {
                beforeEach(function() {
                    parentClass.prototype.testFunction = function(arg1, arg2) {
                        return this._super('testFunction', arguments);
                    };
                    spyOn(parentClass.prototype, 'testFunction').andCallThrough();
                });

                it("the grandParent should get called", function() {
                    expect(child.testFunction()).toEqual('grandParent');
                    expect(parentClass.prototype.testFunction.callCount).toEqual(1);
                    expect(grandParentClass.prototype.testFunction.callCount).toEqual(1);
                });

                it("passes arguments", function() {
                    child.testFunction('foo', 'bar');
                    expect(parentClass.prototype.testFunction).toHaveBeenCalledWith('foo', 'bar');
                    expect(grandParentClass.prototype.testFunction).toHaveBeenCalledWith('foo', 'bar');
                });
            });

            describe("when the parent has no method defined", function() {
                beforeEach(function() {
                    delete parentClass.prototype.testFunction;
                });

                it("calls through to the grandParent", function() {
                    expect(child.testFunction()).toEqual('grandParent');
                    expect(grandParentClass.prototype.testFunction.callCount).toEqual(1);
                });
            })
        });
    });

    describe("_super", function() {
        var Friend, Animal, Mammal, Pet, Dog, CockerSpaniel;

        beforeEach(function() {
            Friend = Backbone.Model.extend({
                greet: function(personName, timeOfDay) {
                    return "Good " + timeOfDay + ", " + personName + ". My name is " + this.get("name") + ".";
                },

                numFeet: 2
            });

            // super needs to work even when there are classes in the
            // inheritance hierarchy that do not override the method.
            Animal = Friend.extend({ eats: "food" });

            Mammal = Animal.extend({
                greet: function(personName, timeOfDay) {
                    return this._super("greet", arguments) + " I'm a mammal.";
                }
            });

            Pet = Mammal.extend({ livesInCaptivity: true });

            Dog = Pet.extend({
                greet: function(person, timeOfDay) {
                    return this._super("greet", arguments) + " Ruff ruff!";
                },

                numFeet: function() {
                    return this._super("numFeet") + 2;
                }
            });

            CockerSpaniel = Dog.extend({ cute: true });

            spyOn(Friend.prototype, 'greet').andCallThrough();
            spyOn(Mammal.prototype, 'greet').andCallThrough();
            spyOn(Dog.prototype,    'greet').andCallThrough();
        });

        context("when the superclass has a non-function property with the same name", function() {
            it("returns the value of that property", function() {
                var dog = new Dog();
                expect(dog.numFeet()).toBe(4);
            });
        });

        context("when used only once in the inheritance hierarchy", function() {
            context("in the class's own implementation of the method", function() {
                beforeEach(function() {
                    this.friend = new Mammal({ name: "Benjie" });
                });

                itCallsTheOverriddenMethodCorrectly();
            });

            context("in a superclass's implementation of the method", function() {
                beforeEach(function() {
                    this.friend = new Pet({ name: "Benjie" });
                });

                itCallsTheOverriddenMethodCorrectly();

                it("does not call the object's own method more than once", function() {
                    this.friend.greet("Barbara", "morning");
                    expect(Mammal.prototype.greet.callCount).toBe(1);
                });
            });
        });

        context("when used twice in the inheritance hierarchy", function() {
            context("with the first case happening in the class's own implementation", function() {
                beforeEach(function() {
                    this.friend = new Dog({ name: "Benjie" });
                });

                itCallsTheOverriddenMethodCorrectly();

                it("calls both of the ancestor classes' methods", function() {
                    var greeting = this.friend.greet("Barbara", "morning");
                    expect(greeting).toContain("I'm a mammal.");
                });
            });

            context("with the first case happening in a superclass's implementation", function() {
                beforeEach(function() {
                    this.friend = new CockerSpaniel({ name: "Benjie" });
                });

                itCallsTheOverriddenMethodCorrectly();

                it("does not call the object's own method more than once", function() {
                    this.friend.greet("Barbara", "morning");
                    expect(Dog.prototype.greet.callCount).toBe(1);
                });
            });
        });

        context("when the overridden method calls super by referencing its constructor explicitly", function() {
            beforeEach(function() {
                Mammal.prototype.greet = function(personName, timeOfDay) {
                    return Mammal.__super__.greet.apply(this, arguments) + " I'm a mammal.";
                }
                spyOn(Mammal.prototype, 'greet').andCallThrough();

                this.friend = new CockerSpaniel({ name: "Benjie" });
            });

            itCallsTheOverriddenMethodCorrectly();
        });

        function itCallsTheOverriddenMethodCorrectly() {
            it("passes the given arguments to the overridden method", function() {
                var greeting = this.friend.greet("Barbara", "morning");
                expect(greeting).toContain("Good morning, Barbara.");
            });

            it("calls the overridden method on the recieving object", function() {
                var greeting = this.friend.greet("Barbara", "morning");
                expect(greeting).toContain("My name is Benjie.");
            });

            it("calls the overridden method only once", function() {
                this.friend.greet("Barbara", "morning");
                expect(Friend.prototype.greet.callCount).toBe(1);
                expect(Mammal.prototype.greet.callCount).toBe(1);
            });

            it("can be called multiple times with the same results", function() {
                var greeting = this.friend.greet("Barbara", "morning");
                expect(this.friend.greet("Barbara", "morning")).toBe(greeting);
                expect(this.friend.greet("Barbara", "morning")).toBe(greeting);
            });
        }
    });

    describe("unbind", function() {
        var fakeContext = function(name) { this.name = name };
        beforeEach(function() {
            this.callback = jasmine.createSpy();
            this.context1 = new fakeContext("1");
            this.context2 = new fakeContext("2");
            this.model = new Backbone.Model();
            this.model.bind("fake", this.callback, this.context1);
            this.model.bind("fake", this.callback, this.context2);
        });

        it("does not unbind both events when unbind is called with a context", function() {
            this.model.unbind('fake', this.callback, this.context2);
            this.model.trigger('fake');
            expect(this.callback.callCount).toBe(1);
            expect(this.callback.mostRecentCall.object).toBe(this.context1);
        });

        it("unbinds all events that match a given event, callback, and context", function() {
            this.model.bind("fake", this.callback, this.context2);
            this.model.unbind('fake', this.callback, this.context2);
            this.model.trigger('fake');
            expect(this.callback.callCount).toBe(1);
            expect(this.callback.mostRecentCall.object).toBe(this.context1);
        });

        it("unbinds all events that match a given event and callback when no context is passed", function() {
            this.model.unbind('fake', this.callback);
            this.model.trigger('fake');
            expect(this.callback).not.toHaveBeenCalled();
        });
    });

    describe(".include(*modules)", function() {
        var Klass, module1, module2, module3;

        beforeEach(function() {
            module1 = { foo1: function() { return "bar1" } };
            module2 = { foo2: function() { return "bar2" } };
            module3 = { foo3: function() { return "bar3" } };
            Klass = chorus.models.Base.include(module1, module2, module3);
        });

        it("returns a constructor whose prototype has all of the given modules' properties", function() {
            var instance = new Klass();
            expect(instance.foo1()).toBe("bar1");
            expect(instance.foo2()).toBe("bar2");
            expect(instance.foo3()).toBe("bar3");
            expect(instance).toBeA(chorus.models.Base);
        });

        it("does not mutate the modules", function() {
            expect(_.keys(module1)).toEqual(["foo1"]);
            expect(_.keys(module2)).toEqual(["foo2"]);
            expect(_.keys(module3)).toEqual(["foo3"]);
        });

        describe("when the returned constructor is extended", function() {
            var SubKlass;

            beforeEach(function() {
                SubKlass = Klass.extend({
                    foo1: function() {
                        return this._super("foo1", arguments) + "baz";
                    }
                });
            });

            it("makes the included module methods accessible via 'super'", function() {
                var instance = new SubKlass();
                expect(instance.foo1()).toBe("bar1baz");
                expect(new (SubKlass.include({}))).toBeA(SubKlass);
            });
        });
    });
});

