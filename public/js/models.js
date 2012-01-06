(function($) {
    chorus.models = {
        Collection: Backbone.Collection.extend(_.extend({}, chorus.Mixins.Urls, chorus.Mixins.Events, {
            initialize: function(models, options) {
                this.attributes = options || {};
                this.setup(arguments);
            },

            setup: $.noop,

            url: function(options) {
                options = _.extend({
                    rows : 50,
                    page : 1
                }, options);

                var uri = new URI("/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes));

                if (this.urlParams) {
                    var params = _.isFunction(this.urlParams) ? this.urlParams(options) : this.urlParams;
                    uri.addSearch(params);
                }

                uri.addSearch({
                    page: options.page,
                    rows: options.rows
                });

                if (this.sortIndex && this.sortOrder) {
                    uri.addSearch({
                        sidx: this.sortIndex,
                        sord: this.sortOrder
                    });
                }

                // this ensures that IE doesn't cache 'needs_login' responses
                if (!window.jasmine) {
                    uri.addSearch({iebuster: new Date().getTime()});
                }

                return uri.normalizeSearch().toString();
            },

            fetchPage: function(page, options) {
                var url = this.url({page : page});
                options = _.extend({}, options, { url: url });
                this.fetch(options);
            },

            fetchAll : (function() {
                var fetchPage = function(page) {
                    this.fetch({
                        url : this.url({ page: page, rows: 1000 }),
                        silent: true,
                        add : page != 1,
                        success : function(collection, resp) {
                            if (resp.status == "ok") {
                                var total = parseInt(resp.pagination.total);
                                var page = parseInt(resp.pagination.page);
                                if (page >= total) {
                                    collection.trigger("reset", collection);
                                } else {
                                    fetchPage.call(collection, page + 1);
                                }
                            } else {
                                collection.trigger("reset", collection);

                            }
                        }
                    });
                };

                return function() {
                    fetchPage.call(this, 1);
                }
            })(),


            parse : function(data) {
                if (data.status == "needlogin") {
                    chorus.session.trigger("needsLogin");
                }
                this.pagination = data.pagination;
                this.loaded = true;
                return data.resource;
            },

            sortDesc : function(idx) {
                this._sort(idx, "desc")
            },

            sortAsc : function(idx) {
                this._sort(idx, "asc")
            },

            _sort : function(idx, order) {
                this.sortIndex = idx
                this.sortOrder = order
            }
        })),

        Base: Backbone.Model.extend(_.extend({}, chorus.Mixins.Urls, chorus.Mixins.Events, {
            url: function(options) {
                var template = _.isFunction(this.urlTemplate) ? this.urlTemplate(options) : this.urlTemplate;
                var uri = new URI("/edc/" + Handlebars.compile(template)(this.attributes));
                if (this.urlParams) {
                    var params = _.isFunction(this.urlParams) ? this.urlParams(options) : this.urlParams;
                    uri.addSearch(params);
                }
                return uri.normalizeSearch().toString();
            },

            activities : function() {
                if (!this._activities) {
                    if (!this.entityType) {
                        throw "Cannot create activities without having an entityType";
                    }

                    this._activities = new chorus.models.ActivitySet([], { entityType : this.entityType, entityId : this.get("id") });
                    this.bind("invalidated", this._activities.fetch, this._activities)
                }

                return this._activities;
            },

            parse: function(data) {
                if (data.status == "needlogin") {
                    chorus.session.trigger("needsLogin");
                }
                this.loaded = true;
                if (data.status == "ok") {
                    return data.resource[0]
                } else {
                    this.serverErrors = data.message;
                }
            },

            save : function(attrs, options) {
                options || (options = {});
                var effectiveAttrs = attrs || {};
                this.beforeSave(effectiveAttrs, options);
                var success = options.success;
                options.success = function(model, resp, xhr) {
                    var savedEvent = model.serverErrors ? "saveFailed" : "saved"
                    model.trigger(savedEvent, model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                this.serverErrors = undefined;

                if (this.performValidation(effectiveAttrs)) {
                    this.trigger("validated");
                    var attrsToSave = _.isEmpty(effectiveAttrs) ? undefined : effectiveAttrs;
                    return Backbone.Model.prototype.save.call(this, attrsToSave, options);
                } else {
                    this.trigger("validationFailed");
                    return false;
                }
            },

            fetch: function(options) {
                options || (options = {});
                var success = options.success;
                options.success = function(model, resp, xhr) {
                    if (model.serverErrors) model.trigger('fetchFailed', model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                return Backbone.Model.prototype.fetch.call(this, options);
            },

            destroy : function(options) {
                options || (options = {});
                if (this.isNew()) return this.trigger('destroy', this, this.collection, options);
                var model = this;
                var success = options.success;
                options.success = function(resp) {
                    if (!model.set(model.parse(resp), options)) return false;

                    var event = (resp.status === "ok") ? "destroy" : "destroyFailed";
                    model.trigger(event, model, model.collection, options);

                    if (success) success(model, resp);
                };

                return (this.sync || Backbone.sync).call(this, 'delete', this, options);
            },

            declareValidations: $.noop,
            beforeSave: $.noop,

            isValid: function() {
                return _.isEmpty(this.errors);
            },

            performValidation: function(newAttrs) {
                this.errors = {};
                this.declareValidations(newAttrs);
                return _(this.errors).isEmpty();
            },

            setValidationError : function(attr, message_key) {
                this.errors[attr] = this.errors[attr] || t(message_key, {fieldName: this._textForAttr(attr)});
            },

            require : function(attr, newAttrs) {
                var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);

                var present = value;

                if (value && _.isString(value) && value.match(/^\s*$/)) {
                    present = false;
                }

                if (!present) {
                    this.setValidationError(attr, "validation.required");
                }
            },

            requirePattern : function(attr, regex, newAttrs) {
                var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);

                if (!value || !value.match(regex)) {
                    this.setValidationError(attr, "validation.required_pattern");
                }
            },

            requireConfirmation : function(attr, newAttrs) {
                var confAttrName = attr + "Confirmation";
                var value, conf;

                if (newAttrs && newAttrs.hasOwnProperty(attr)) {
                    if (newAttrs.hasOwnProperty(confAttrName)) {
                        value = newAttrs[attr];
                        conf = newAttrs[confAttrName];
                    } else {
                        throw "newAttrs supplied an original value but not a confirmation";
                    }
                } else {
                    value = this.get(attr);
                    conf = this.get(confAttrName);
                }

                if (!value || !conf || value != conf) {
                    this.setValidationError(attr, "validation.confirmation");
                }
            },

            _textForAttr : function(attr) {
                return (this.attrToLabel && this.attrToLabel[attr]) ? t(this.attrToLabel[attr]) : attr;
            }
        }))
    };

})(jQuery);
