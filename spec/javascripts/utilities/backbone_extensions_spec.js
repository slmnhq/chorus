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
                    return this._super('testFunction', arg1, arg2);
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
                        return this._super('testFunction', arg1, arg2);
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
});
