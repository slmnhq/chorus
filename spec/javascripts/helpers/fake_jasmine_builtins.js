(function(){
    var FakeJasmineBuiltins = {
        toBe: function(){},
        toEqual: function(){},
        toMatch: function(){},
        toBeDefined: function(){},
        toBeUndefined: function(){},
        toBeNull: function(){},
        toBeTruthy: function(){},
        toBeFalsy: function(){},
        toHaveBeenCalled: function(){},
        toHaveBeenCalledWith: function(){},
        toContain: function(){},
        toBeLessThan: function(){},
        toBeGreaterThan: function(){},
        toBeCloseTo: function(){},
        toThrow: function(){},

        createSpy: function(){}
    }
});

var beforeEach = window.beforeEach;
var describe = window.describe;
var afterEach = window.afterEach;
var it = window.it;
var expect = window.expect;
var context = window.context;
var jasmine = window.jasmine;