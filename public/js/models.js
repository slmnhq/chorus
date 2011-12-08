(function($) {
    chorus.models = {
        Collection: Backbone.Collection.extend(_.extend({}, chorus.Mixins.Events, {
            initialize: function(models, options) {
                this.attributes = options || {};
                this.setup(arguments);
            },

            setup: $.noop,
            additionalParams: $.noop,

            url: function(options) {
                options = _.extend({
                    rows : 50,
                    page : 1
                }, options);

                var url = "/edc/" + Handlebars.compile(this.urlTemplate)(this.attributes);

                var params = [];

                 _.each(this.additionalParams(), function(param){
                    params.push(param)
                })

                params.push("page=" + options.page);
                params.push("rows=" + options.rows);

                if (this.sortIndex && this.sortOrder) {
                    params.push("sidx=" + this.sortIndex);
                    params.push("sord=" + this.sortOrder);
                }

                var paramsJoiner = (url.indexOf('?') != -1) ? '&' : '?'
                url = url + paramsJoiner + params.join("&")

                return url;
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

        Base: Backbone.Model.extend(_.extend({}, chorus.Mixins.Events, {
            url: function(hidePrefix) {
                var prefix = (hidePrefix ? '' : "/edc/")
                return prefix + Handlebars.compile(this.urlTemplate)(this.attributes);
            },

            showUrl: function(hidePrefix) {
                if (!this.showUrlTemplate) {
                    throw "No showUrlTemplate defined";
                }

                var prefix = hidePrefix ? '' : "#/"
                return prefix + Handlebars.compile(this.showUrlTemplate)(this.attributes);
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
                var success = options.success;
                options.success = function(model, resp, xhr) {
                    var savedEvent = model.serverErrors ? "saveFailed" : "saved"
                    model.trigger(savedEvent, model, resp, xhr);
                    if (success) success(model, resp, xhr);
                };
                this.serverErrors = undefined;

                if (this.performValidation(attrs)) {
                    this.trigger("validated");
                    return Backbone.Model.prototype.save.call(this, attrs, options);
                } else {
                    this.trigger("validationFailed");
                    return false;
                }
            },

            destroy : function(options) {
                options || (options = {});
                if (this.isNew()) return this.trigger('destroy', this, this.collection, options);
                var model = this;
                var success = options.success;
                options.success = function(resp) {
                    if (!model.set(model.parse(resp), options)) return false;

                    if (resp.status == "ok") {
                        model.trigger('destroy', model, model.collection, options);
                    } else {
                        model.trigger('destroyFailed', model, model.collection, options);
                    }

                    if (success) success(model, resp);
                };

                return (this.sync || Backbone.sync).call(this, 'delete', this, options);
            },

            declareValidations: $.noop,

            performValidation: function(newAttrs) {
                this.errors = {};
                this.declareValidations(newAttrs);
                return _(this.errors).isEmpty();
            },

            require : function(attr, newAttrs) {
                var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);

                var present = value;

                if (value && _.isString(value) && value.match(/^\s*$/)) {
                    present = false;
                }

                if (!present) {
                    this.errors[attr] = t("validation.required", this._textForAttr(attr));
                }
            },

            requirePattern : function(attr, regex, newAttrs) {
                var value = newAttrs && newAttrs.hasOwnProperty(attr) ? newAttrs[attr] : this.get(attr);

                if (!value || !value.match(regex)) {
                    this.errors[attr] = t("validation.required_pattern", this._textForAttr(attr));
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
                    this.errors[attr] = t("validation.confirmation", this._textForAttr(attr));
                }
            },

            _textForAttr : function(attr) {
                return (this.attrToLabel && this.attrToLabel[attr]) ? t(this.attrToLabel[attr]) : attr;
            }
        }))
    }
})(jQuery);
