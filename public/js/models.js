chorus.models = {
    Base: Backbone.Model.extend(_.extend({}, chorus.Mixins.Urls, chorus.Mixins.Events, chorus.Mixins.dbHelpers, chorus.Mixins.Fetching, {
        constructorName: "Model",

        url: function(options) {
            var template = _.isFunction(this.urlTemplate) ? this.urlTemplate(options) : this.urlTemplate;
            var context = _.extend({}, this.attributes, { entityId: this.entityId, entityType: this.entityType })
            var uri = new URI("/edc/" + Handlebars.compile(template)(context));
            if (this.urlParams) {
                var params = _.isFunction(this.urlParams) ? this.urlParams(options) : this.urlParams;
                uri.addSearch(params);
            }
            if (!window.jasmine) { uri.addSearch({iebuster: new Date().getTime()}); }
            return uri.normalizeSearch().toString();
        },

        activities: function(entityType) {
            entityType = entityType || this.entityType;

            if (!this._activities || this._activities.attributes.entityType != entityType) {
                if (!entityType) {
                    throw "Cannot create activities without having an entityType";
                }

                this._activities = new chorus.collections.ActivitySet([], { entityType: entityType, entityId: this.entityId || this.get("id") });
                this.bind("invalidated", this._activities.fetch, this._activities)
            }

            return this._activities;
        },

        dataStatusOk: function(data) {
            return data.status == 'ok';
        },

        dataErrors: function(data) {
            return data.message;
        },

        parse: function(data) {
            if (data.status == "needlogin") {
                chorus.session.trigger("needsLogin");
            }
            if (this.dataStatusOk(data)) {
                this.loaded = true;
                this.serverErrors = undefined;
                return data.resource[0]
            } else {
                this.serverErrors = this.dataErrors(data);
            }
        },

        save: function(attrs, options) {
            options || (options = {});
            var effectiveAttrs = attrs || {};
            this.beforeSave(effectiveAttrs, options);
            var success = options.success;
            options.success = function(model, resp, xhr) {
                var savedEvent = model.serverErrors ? "saveFailed" : "saved"
                model.trigger(savedEvent, model, resp, xhr);
                if (success) success(model, resp, xhr);
            };
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
            this.fetching = true;
            options || (options = {});
            var success = options.success;
            options.success = function(model, resp, xhr) {
                if (model.serverErrors) model.trigger('fetchFailed', model, resp, xhr);
                if (model.loaded) {
                    model.trigger('loaded');
                }
                if (success) success(model, resp, xhr);
            };
            return this._super('fetch', [options])
                .always(_.bind(function() {
                this.fetching = false;
            }, this));
        },

        destroy: function(options) {
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

        clearErrors: function() {
            this.errors = {};
        },

        performValidation: function(newAttrs) {
            this.errors = {};
            this.declareValidations(newAttrs);
            return _(this.errors).isEmpty();
        },

        setValidationError: function(attr, message_key, custom_key, vars) {
            vars = vars || {};
            vars["fieldName"] = this._textForAttr(attr);
            this.errors[attr] = this.errors[attr] || t((custom_key || message_key), vars);
        },

        require: function(attr, newAttrs, messageKey) {
            var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);

            var present = value;

            if (value && _.isString(value) && value.match(/^\s*$/)) {
                present = false;
            }

            if (!present) {
                this.setValidationError(attr, "validation.required", messageKey);
            }
        },

        requirePositiveInteger: function(attr, newAttrs, messageKey) {
            var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);
            var intValue = parseInt(value, 10);
            if (!intValue || intValue <= 0 || parseFloat(value) !== intValue) {
                this.setValidationError(attr, "validation.positive_integer", messageKey);
            }
        },

        requirePattern: function(attr, regex, newAttrs, messageKey, allowBlank) {
            var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);
            if(allowBlank && !value) {
                return
            }

            if (!value || !value.match(regex)) {
                this.setValidationError(attr, "validation.required_pattern", messageKey);
            }
        },

        requireConfirmation: function(attr, newAttrs, messageKey) {
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
                this.setValidationError(attr, "validation.confirmation", messageKey);
            }
        },

        requireIntegerRange: function(attr, min, max, newAttrs, messageKey) {
            var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);
            var intValue = parseInt(value, 10);
            if (!intValue || intValue < min || intValue > max || parseFloat(value) !== intValue) {
                this.setValidationError(attr, "validation.integer_range", messageKey, { min: min, max: max });
            }
        },

        hasOwnPage: function() {
            return false;
        },

        highlightedAttribute: function(attr) {
            var highlightedAttrs = this.get("highlightedAttributes");
            if(highlightedAttrs && highlightedAttrs[attr]) {
                var attribute = highlightedAttrs[attr];
                return _.isArray(attribute) ? attribute[0] : attribute;
            }
        },

        name: function() {
            if(this.nameFunction) {
                return this[this.nameFunction]();
            }
            return this.get(this.nameAttribute);
        },

        highlightedName: function() {
            var highlightedModel = chorus.helpers.withSearchResults(this);
            return new Handlebars.SafeString(highlightedModel.name());
        },

        _textForAttr: function(attr) {
            return (this.attrToLabel && this.attrToLabel[attr]) ? t(this.attrToLabel[attr]) : attr;
        }
    }))
};
chorus.models.Base.extend = chorus.classExtend;

chorus.collections = {
    Base: Backbone.Collection.extend(_.extend({}, chorus.Mixins.Urls, chorus.Mixins.Events, chorus.Mixins.Fetching, {
        constructorName: "Collection",

        initialize: function(models, options) {
            this.attributes = options || {};
            this.setup(arguments);
        },

        findWhere: function(attrs) {
            return this.find(function(model) {
                return _.all(attrs, function(value, key) {
                    return model.get(key) === value;
                });
            });
        },

        setup: $.noop,

        url: function(options) {
            options = _.extend({
                rows: 50,
                page: 1
            }, options);

            var template = _.isFunction(this.urlTemplate) ? this.urlTemplate(options) : this.urlTemplate;
            var uri = new URI("/edc/" + Handlebars.compile(template)(this.attributes));

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

        fetch: function(options) {
            this.fetching = true;
            options || (options = {});
            var success = options.success;
            options.success = function(collection, resp) {
                if (collection.loaded && !options.silent) {
                    collection.trigger('loaded');
                }
                if (success) success(collection, resp);
            };
            return this._super('fetch', [options])
                .always(_.bind(function() {
                this.fetching = false;
            }, this));
        },


        fetchPage: function(page, options) {
            var url = this.url({page: page});
            options = _.extend({}, options, { url: url });
            this.fetch(options);
        },

        fetchAll: (function() {
            var fetchPage = function(page) {
                this.fetch({
                    url: this.url({ page: page, rows: 1000 }),
                    silent: true,
                    add: page != 1,
                    success: function(collection, resp) {
                        if (resp.status == "ok") {
                            var total = resp.pagination ? parseInt(resp.pagination.total) : 1;
                            var page = resp.pagination ? parseInt(resp.pagination.page) : 1;
                            if (page >= total) {
                                collection.trigger("reset", collection);
                                collection.trigger("loaded");
                            } else {
                                fetchPage.call(collection, page + 1);
                            }
                        } else {
                            collection.trigger("reset", collection);
                            collection.trigger("loaded");
                        }
                    }
                });
            };

            return function() {
                fetchPage.call(this, 1);
            }
        })(),


        parse: function(data) {
            if (data.status == "needlogin") {
                chorus.session.trigger("needsLogin");
            }
            this.pagination = data.pagination;
            if (data.status == 'ok') {
                this.loaded = true;
            }
            return data.resource;
        },

        sortDesc: function(idx) {
            this._sort(idx, "desc")
        },

        sortAsc: function(idx) {
            this._sort(idx, "asc")
        },

        _sort: function(idx, order) {
            this.sortIndex = idx
            this.sortOrder = order
        }
    }))
};
chorus.collections.Base.extend = chorus.classExtend;

