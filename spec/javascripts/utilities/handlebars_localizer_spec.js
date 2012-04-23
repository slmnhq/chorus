describe("handlebars_localizer", function() {
    describe("t", function() {
        beforeEach(function() {
            spyOn(window, 't');
        });

        context("when called from handlebars with named arguments", function() {
            it("passes those arguments to the translation function in a hash", function() {
                Handlebars.compile('{{t "translation_key" name1=33 name2="abcd"}}')();
                expect(window.t).toHaveBeenCalledWith('translation_key', {name1: 33, name2: 'abcd'});
            });
        });

        context("when called from handlebars with just a key", function() {
            it("doesn't blow up", function() {
                Handlebars.compile('{{t "translation_key"}}')();
                expect(window.t.mostRecentCall.args[0]).toBe('translation_key');
            });
        });
    });
});