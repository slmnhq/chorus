describe("spec_helper", function() {
    describe("stubQtip", function() {
        beforeEach(function() {
            this.span = $("<span></span>");
            this.anchor = $("<a></a>");
            this.el = $("<div></div>").append(this.span).append(this.anchor);

            this.anchorQtip = stubQtip("a");
            this.spanQtip = stubQtip("span");
        });

        it("returns a different fake qtip element for every unique selector", function() {
            expect(this.anchorQtip).toBeA(jQuery);
            expect(this.spanQtip).toBeA(jQuery);

            expect(this.anchorQtip).not.toBe(this.spanQtip);
        });

        describe("when qtip is called on one of the stubbed selectors", function() {
            beforeEach(function() {
                this.el.find("a").qtip({ content: "<li>fake</li>" });
            });

            it("only affects the fake qtip element for that selector", function() {
                this.el.find('a').mouseenter();
                expect(this.anchorQtip.find("li")).toHaveText("fake");

                this.el.find('span').mouseenter();
                expect(this.spanQtip).not.toContain("li");
            });
        });
    });

    describe("stubModals", function() {
        beforeEach(function() {
            this.modals = stubModals();

            this.modal1 = new chorus.alerts.EmptyCSV();
            this.modal2 = new chorus.alerts.NoLdapUser();
            this.modal1.launchModal();
            this.modal2.launchModal();
        });

        describe("#lastModal", function() {
            it("returns the most recently launched modal view", function() {
                expect(this.modals.lastModal()).toBe(this.modal2);
            });
        });

        describe("#reset", function() {
            it("resets the modal spy call count", function() {
                expect(this.modals.lastModal()).toBe(this.modal2);
                this.modals.reset();
                expect(this.modals.lastModal()).toBeUndefined();
            });
        });

        describe("the toHaveModal matcher", function() {
            it("checks if an instance of the given modal class has ever been launched", function() {
                expect(this.modals).toHaveModal(chorus.alerts.NoLdapUser);
                expect(this.modals).toHaveModal(chorus.alerts.EmptyCSV);

                expect(this.modals).not.toHaveModal(chorus.alerts.RemoveJoinConfirmAlert);
            });
        });
    });

    describe("#toBeA", function() {
        context("when passed a string", function() {
            it("does a 'typeof' check", function() {
                expect(1).toBeA("number");
                expect(1).not.toBeA("string");
                expect("hello").toBeA("string");
                expect("hello").not.toBeA("number");
            });
        });

        context("when passed a function", function() {
            it("does an 'instanceof' check", function() {
                expect(rspecFixtures.user()).toBeA(chorus.models.User);
                expect(rspecFixtures.user()).not.toBeA(chorus.models.BoxplotTask);
            });
        });
    });

    describe("#toMatchUrl", function() {
        context("when *no* 'paramsToIgnore' option is passed", function() {
            it("compares the urls, including all query parameters", function() {
                expect("/foo?bar=1&baz=2").not.toMatchUrl("/foo?baz=2");

                expect("/foo?bar=1&baz=2").toMatchUrl("/foo?baz=2&bar=1");
            });
        });

        context("when a 'paramsToIgnore' option is passed", function() {
            it("compares the urls, disregarding the given query parameters", function() {
                expect("/foo?bar=1&baz=2&quux=3").not.toMatchUrl("/foo?baz=2", {
                    paramsToIgnore: ["quux"]
                });
                expect("/foo?baz=2").not.toMatchUrl("/foo?bar=1&baz=2&quux=3", {
                    paramsToIgnore: ["quux"]
                });

                expect("/foo?bar=1&baz=2&quux=3").toMatchUrl("/foo?baz=2", {
                    paramsToIgnore: ["bar", "quux"]
                });
                expect("/foo?baz=2").toMatchUrl("/foo?bar=1&baz=2&quux=3", {
                    paramsToIgnore: ["bar", "quux"]
                });
            });
        });
    });

    describe("#toHaveUrlPath", function() {
        it("should match against the path of the url", function() {
            expect("/foo/bar").toHaveUrlPath("/foo/bar")
        });

        it("should ignore query parameters", function() {
            expect("/foo/bar?option1=foo").toHaveUrlPath("/foo/bar")
        });
    });

    describe("#toContainQueryParams", function() {
        it("should match against the supplied query parameters", function() {
            expect("/foo/bar?option1=hello&option2=world").toContainQueryParams({
                option1 : "hello",
                option2 : "world"
            });
        });

        it("should match a subset of the parameters in the url", function() {
            expect("/foo/bar?option1=hello&option2=world").toContainQueryParams({
                option1 : "hello"
            });
        });
    });

    describe("#toHaveBeenCalledOn", function() {
        beforeEach(function() {
            this.model1 = rspecFixtures.user()
            this.model2 = rspecFixtures.user()
            spyOn(chorus.models.User.prototype, 'fetch')
            spyOn(chorus.models.User.prototype, 'save')
        });

        it("passes if the given spy was ever called on the given object", function() {
            this.model1.fetch()
            this.model2.fetch()
            expect(chorus.models.User.prototype.fetch).toHaveBeenCalledOn(this.model1)
            this.model2.save()
            expect(chorus.models.User.prototype.save).not.toHaveBeenCalledOn(this.model1)
        });
    });

    describe("#toHaveBeenCalledWithSorta", function() {
        beforeEach(function() {
            this.theObject = { test: function() {} };
            spyOn(this.theObject, "test");
        });

        it("mis-match", function() {
            var foo = {abc: "xyz"};
            this.theObject.test({});
            expect(this.theObject.test).not.toHaveBeenCalledWithSorta(foo);
        });


        it("identity", function() {
            var foo = {abc: "xyz"};
            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(foo);
        });

        it("field equivalence", function() {
            var foo = {abc: "xyz"};
            var bar = {abc: "xyz"};
            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar);
        });

        it("removes fields from both", function() {
            var foo = {abc: "xyz", def: "should disappear", number: 1, favourite_ice_cream_flavour: "chocolate"};
            var bar = {abc: "xyz", def: "bc I said so", number: 51, favourite_ice_cream_flavour: "strawberry"};

            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar, ["def", "number", "favourite_ice_cream_flavour"]);
        });

        it("removes fields from actual", function() {
            var foo = {abc: "xyz", def: "should disappear"};
            var bar = {abc: "xyz"};

            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar, ["def"]);
        });

        it("removes fields from expected", function() {
            var foo = {abc: "xyz"};
            var bar = {abc: "xyz", def: "should disappear"};

            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar, ["def"]);
        });

        it("can compare same backbone model", function() {
            var foo = new chorus.models.User({ a: "a", b: "b" });
            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(foo);
        });

        it("can compare similar backbone models", function() {
            var foo = new chorus.models.User({ a: "a", b: "b" });
            var bar = new chorus.models.User({ a: "a", b: "b" });

            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar);
        });

        it("can handle backbone models with field exceptions", function() {
            var foo = new chorus.models.User({ a: "a", b: "b" });
            var bar = new chorus.models.User({ a: "a", b: "c" });

            this.theObject.test(foo);
            expect(this.theObject.test).toHaveBeenCalledWithSorta(bar, ["b"]);
        });
    });

    describe("#toHaveHref", function() {
        it("passes if the element has the href", function() {
            var elem = $("<a/>").attr("href", "http://example.com/foo/bar")
            expect(elem).toHaveHref("http://example.com/foo/bar")
        });

        it("decodes the expected and actual before comparison", function() {
            var elem = $("<a/>").attr("href", "http://example.com/foo|bar%7Cbaz")
            expect(elem).toHaveHref("http://example.com/foo%7Cbar|baz")
        });

        it("fails if element does not have the href", function() {
            var elem = $("<a/>").attr("href", "http://example.com/foo/bar")
            expect(elem).not.toHaveHref("http://yahoo.com")
        });
    });

    describe("#toHaveAttrs", function() {
        var model;
        beforeEach(function() {
            model = new chorus.models.Base({ key1: "foo", key2: "bar", key3: "baz" });
        });

        it("checks that the actual object contains all the attrs from the expected object", function() {
            expect(model).toHaveAttrs({ key1: "foo", key2: "bar", key3: "baz" });
            expect(model).not.toHaveAttrs({ key4: "qux" });
            expect(model).not.toHaveAttrs({ key1: "baz" });
        });

        it("allows other unspecified attributes", function() {
            expect(model).toHaveAttrs({ key1: "foo", key3: "baz" });
        });
    });
});
