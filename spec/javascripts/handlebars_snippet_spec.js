describe("handlebars", function() {
    describe("registered helpers", function() {
        describe("cache_buster", function() {
            it("should be different when called at different times", function() {
                var first_cb, second_cb;
                runs(function() {
                    first_cb = Handlebars.compile("{{cache_buster}}")();
                });

                waits(1); // milliseconds

                runs(function() {
                    second_cb = Handlebars.compile("{{cache_buster}}")();
                });

                runs(function() {
                    expect(first_cb).not.toEqual(second_cb);
                });
            });
        });

        describe("ifAdmin", function() {
            beforeEach(function() {
                this.originalUser = chorus.user;
                this.ifAdminSpy = jasmine.createSpy();
                this.ifAdminSpy.inverse = jasmine.createSpy();
            });

            afterEach(function() {
                chorus.user = this.originalUser;
            });

            describe("when the user is an admin", function() {
                beforeEach(function() {
                    chorus.user.set({ admin: true });
                });

                it("returns executes the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy).toHaveBeenCalled();
                    expect(this.ifAdminSpy.inverse).not.toHaveBeenCalled();
                })
            });

            describe("when the user is not an admin", function() {
                beforeEach(function() {
                    chorus.user.set({ admin: false });
                });

                it("does not execute the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy.inverse).toHaveBeenCalled();
                    expect(this.ifAdminSpy).not.toHaveBeenCalled();
                });
            });

            describe("when chorus.user is undefined", function() {
                beforeEach(function() {
                    chorus.user = undefined;
                });

                it("does not execute the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy.inverse).toHaveBeenCalled();
                    expect(this.ifAdminSpy).not.toHaveBeenCalled();
                });
            })
        });

        describe("ifAll", function() {
          beforeEach(function() {
              this.ifAllSpy = jasmine.createSpy('ifAll');
              this.ifAllSpy.inverse = jasmine.createSpy('ifAll.inverse');
          });

          it("throws an exception if no arguments were passed", function(){
            var exceptionThrown;
            try {
              Handlebars.helpers.ifAll(this.ifAllSpy, this.ifAllSpy.inverse);
            } catch (e) {
              exceptionThrown = e;
            }
            expect(exceptionThrown).toMatch(/argument/);
          });

          context("when an else block is present", function() {
            beforeEach(function() {
              this.template = "{{#ifAll first second}}yes{{else}}no{{/ifAll}}";
            });

            it("renders the else block if any arguments are falsy", function(){
              var context = {first: true, second: false};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("no");
            });

            it("renders the block if all arguments are truthy", function(){
              var context = {first: true, second: true};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("yes");
            });
          });

          context("when an else block is not present", function() {
            beforeEach(function() {
              this.template = "{{#ifAll first second}}yes{{/ifAll}}";
            });

            it("renders nothing if any arguments are falsy", function(){
              var context = {first: true, second: false};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("");
            });

            it("renders the block if all arguments are truthy", function(){
              var context = {first: true, second: true};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("yes");
            });
          });
        });

        describe("ifAny", function() {
          beforeEach(function() {
              this.ifAnySpy = jasmine.createSpy('ifAny');
              this.ifAnySpy.inverse = jasmine.createSpy('ifAny.inverse');
          });

          it("throws an exception if no arguments were passed", function(){
            var exceptionThrown;
            try {
              Handlebars.helpers.ifAny(this.ifAnySpy, this.ifAnySpy.inverse);
            } catch (e) {
              exceptionThrown = e;
            }
            expect(exceptionThrown).toMatch(/argument/);
          });

          context("when an else block is present", function() {
            beforeEach(function() {
              this.template = "{{#ifAny first second}}yes{{else}}no{{/ifAny}}";
            });

            it("renders the else block if all arguments are falsy", function(){
              var context = {first: false, second: false};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("no");
            });

            it("renders the block if any arguments are truthy", function(){
              var context = {first: false, second: true};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("yes");
            });
          });

          context("when an else block is not present", function() {
            beforeEach(function() {
              this.template = "{{#ifAny first second}}yes{{/ifAny}}";
            });

            it("renders nothing if all arguments are falsy", function(){
              var context = {first: false, second: false};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("");
            });

            it("renders the block if any arguments are truthy", function(){
              var context = {first: true, second: false};
              var string = Handlebars.compile(this.template)(context);
              expect(string).toBe("yes");
            });
          });
        });
    });
});
