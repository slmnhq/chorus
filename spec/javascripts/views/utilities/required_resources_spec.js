describe("chorus.RequiredResources", function() {
    beforeEach(function() {
        this.requiredResources = new chorus.RequiredResources();
        this.model = rspecFixtures.user();
        this.collection = rspecFixtures.workfileSet();
    });

    it('allows you to add Model objects', function() {
        this.requiredResources.add(this.model);
        expect(this.requiredResources.models).toContain(this.model);
    });

    it('allows you to add Collection objects', function() {
        this.requiredResources.add(this.collection);
        expect(this.requiredResources.models).toContain(this.collection);
    });

    it('allows you to call push instead of add', function() {
        this.requiredResources.push(this.model);
        expect(this.requiredResources.models).toContain(this.model);
    });

    describe("add", function() {
        it("should not trigger add on the object", function() {
            spyOnEvent(this.model, 'add');
            this.requiredResources.add(this.model);
            expect('add').not.toHaveBeenTriggeredOn(this.model);
        });

        it("should trigger add on the requiredResources", function() {
            spyOnEvent(this.requiredResources, 'add');
            this.requiredResources.add(this.model);
            expect('add').toHaveBeenTriggeredOn(this.requiredResources);
        });
    });

    describe("allLoaded", function() {
        beforeEach(function() {
            this.requiredResources.reset([this.model, this.collection]);
        });
        
        it('returns true if all objects are loaded', function() {
            this.model.loaded = true;
            this.collection.loaded = true;
            expect(this.requiredResources.allLoaded()).toBeTruthy();
        });

        it('returns false if one is not loaded', function() {
            this.model.loaded = true;
            this.collection.loaded = false;
            expect(this.requiredResources.allLoaded()).toBeFalsy();
        });

        it('returns true if empty', function() {
            this.requiredResources.reset();
            expect(this.requiredResources.allLoaded()).toBeTruthy();
        });
    });

    describe("#cleanup", function() {
        beforeEach(function() {
            spyOn(this.model, "unbind");
            this.requiredResources.add(this.model);

            spyOn(this.requiredResources, "unbind");
            this.requiredResources.cleanUp()
        });

        it("unbinds the individual resources", function() {
            expect(this.model.unbind).toHaveBeenCalled();
        });

        it("empties the collection", function() {
            expect(this.requiredResources.length).toBe(0);
        });

        it("unbinds the whole collection", function() {
            expect(this.requiredResources.unbind).toHaveBeenCalled();
        });
    });

});

