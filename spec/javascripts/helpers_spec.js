describe("#hasQtip", function(){
    it("returns true for a single item on which qtip has been called", function(){
        var doc = '<div> <span class="foo"/> </div>';
        var item = $('.foo', doc);
        item.qtip();
        expect(item.length).toBe(1);
        expect(item.hasQtip()).toBeTruthy();

    });

    it("returns true for multiple items on which qtip has been called", function(){
        var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
        var item1 = $('.foo', doc);
        item1.qtip();
        var item2 = $('.bar', doc);
        item2.qtip();
        expect($('span', doc).length).toBe(2);
        expect($('span', doc).hasQtip()).toBeTruthy();
    });

    it("returns false for an object that was qtipped and then qtip('destroy')ed", function(){
        var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
        var item1 = $('.foo', doc);
        item1.qtip();
        // qtip('destroy') clears the form, removeData clears the objects -- need to call both
        item1.qtip('destroy');
        item1.removeData("qtip");
        expect(item1.hasQtip()).toBeFalsy();
    });

    it("returns false for an empty jQuery collection", function(){
        expect($().hasQtip()).toBeFalsy();
    });

    it("returns false for multiple items where not all have had qtip called", function(){
        var doc = '<div> <span class="foo"/><span class="bar"/></div>';
        var item1 = $('.foo', doc);
        item1.qtip();
        expect($('span', doc).length).toBe(2);
        expect($('span', doc).hasQtip()).toBeFalsy();
    });
});