describe("handlebars", function(){
    describe("registered partials", function(){
        describe("cache_buster", function(){
            it("should be different when called at different times", function(){
                var first_cb, second_cb;
                runs(function(){
                    first_cb = Handlebars.compile("{{cache_buster}}")();
                });

                waits(1); // milliseconds

                runs(function(){
                    second_cb = Handlebars.compile("{{cache_buster}}")();
                });

                runs(function(){
                    expect(first_cb).not.toEqual(second_cb);
                });
            });
        });
    });
});