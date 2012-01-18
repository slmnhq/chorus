describe("chorus.BindingGroup", function() {
    beforeEach(function() {
        this.view1 = new chorus.views.Base();
        this.view2 = new chorus.views.Base();
        this.model1 = new chorus.models.Base();
        this.model2 = new chorus.models.Base();

        spyOn(this.view1, 'render').andCallFake(function() {
            return "I do one thing";
        });
        spyOn(this.view2, 'render').andCallFake(function() {
            return "I do something else";
        });

        this.bindingGroup = new chorus.BindingGroup(this.view1);
    });

    describe("#add(object, eventName, callback [, context])", function() {
        context("when a context is passed as the fourth parameter", function() {
            beforeEach(function() {
                this.bindingGroup.add(this.model1, 'change', this.view1.render, this.view2);
            });

            it("binds the callback to be called when the event is triggered", function() {
                this.model1.trigger("change");
                expect(this.view1.render).toHaveBeenCalled();
            });

            it("binds the callback to be called in the given context when the event is triggered", function() {
                this.model1.trigger("change");
                expect(this.view1.render.mostRecentCall.object).toBe(this.view2);
            });
        });

        context("when no context parameter is passed", function() {
            beforeEach(function() {
                this.bindingGroup.add(this.model1, 'change', this.view1.render);
            });

            it("calls the callback on the object that was originally passed to the constructor", function() {
                this.model1.trigger("change");
                expect(this.view1.render.mostRecentCall.object).toBe(this.view1);
            });
        });

        context("when a space-separated string of event names is passed", function() {
            beforeEach(function() {
                this.bindingGroup.add(this.model1, 'change saved', this.view1.render);
            });

            it("binds the callback to be called when ANY of the events are triggered", function() {
                this.model1.trigger("change");
                expect(this.view1.render.callCount).toBe(1);
                this.model1.trigger("saved");
                expect(this.view1.render.callCount).toBe(2);
            });
        });
    });

    describe("#remove(eventSource, eventName, callback)", function() {
        beforeEach(function() {
            this.bindingGroup.add(this.model1, 'change', this.view1.render);
            this.bindingGroup.add(this.model2, 'change', this.view1.render);
            this.bindingGroup.add(this.model1, 'saved',  this.view1.render);
            this.bindingGroup.add(this.model2, 'saved',  this.view1.render);

            this.bindingGroup.add(this.model1, 'change', this.view2.render, this.view2);
            this.bindingGroup.add(this.model2, 'change', this.view2.render, this.view2);
            this.bindingGroup.add(this.model1, 'saved',  this.view2.render, this.view2);
            this.bindingGroup.add(this.model2, 'saved',  this.view2.render, this.view2);
        });

        context("when an object, event name and callback are passed", function() {
            beforeEach(function() {
                this.bindingGroup.remove(this.model1, 'change', this.view1.render);
            });

            it("unbinds the given callback", function() {
                this.model1.trigger("change");
                expect(this.view1.render).not.toHaveBeenCalled();
            });

            it("leaves other callbacks bound", function() {
                this.model1.trigger("change");
                expect(this.view2.render).toHaveBeenCalled();

                this.model1.trigger("saved");
                expect(this.view1.render).toHaveBeenCalled();

                this.model2.trigger("change");
                expect(this.view1.render).toHaveBeenCalled();
            });
        });

        context("when an object and event name are passed (no callback)", function() {
            beforeEach(function() {
                this.bindingGroup.remove(this.model1, 'change');
            });

            it("unbinds all callbacks for the given event name", function() {
                this.model1.trigger("change");
                expect(this.view1.render).not.toHaveBeenCalled();
                expect(this.view2.render).not.toHaveBeenCalled();
            });

            it("leaves callbacks for other events or objects bound", function() {
                this.model1.trigger("saved");
                expect(this.view1.render).toHaveBeenCalled();

                this.model2.trigger("change");
                expect(this.view1.render).toHaveBeenCalled();
            });
        });

        context("when only an object is passed (no event name or callback)", function() {
            beforeEach(function() {
                this.bindingGroup.remove(this.model1);
            });

            it("unbinds all callbacks on that object", function() {
                this.model1.trigger("change");
                this.model1.trigger("saved");

                expect(this.view1.render).not.toHaveBeenCalled();
                expect(this.view2.render).not.toHaveBeenCalled();
                expect(this.view1.render).not.toHaveBeenCalled();
            });

            it("leaves callbacks for other objects bound", function() {
                this.model2.trigger("change");
                expect(this.view1.render).toHaveBeenCalled();
                expect(this.view2.render).toHaveBeenCalled();
            });
        });

        context("when no arguments are passed, (same as calling #removeAll)", function() {
            it("unbinds all callbacks", function() {
                this.bindingGroup.remove();

                this.model1.trigger("change");
                this.model2.trigger("change");
                this.model1.trigger("saved");
                this.model2.trigger("saved");

                expect(this.view1.render).not.toHaveBeenCalled();
                expect(this.view2.render).not.toHaveBeenCalled();
            });

            it("is equivalent to calling #removeAll", function() {
                this.bindingGroup.removeAll();

                this.model1.trigger("change");
                this.model2.trigger("change");
                this.model1.trigger("saved");
                this.model2.trigger("saved");

                expect(this.view1.render).not.toHaveBeenCalled();
                expect(this.view2.render).not.toHaveBeenCalled();
            });
        });
    });
});
