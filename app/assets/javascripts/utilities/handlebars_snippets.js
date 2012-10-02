(function() {

    Handlebars.registerPartial("errorDiv", '<div class="errors">{{#if serverErrors }}{{renderErrors serverErrors}}<a class="close_errors action" href="#">{{t "actions.close"}}</a>{{/if}}</div>');

    var templates = {}; //for memoizing handlebars helpers templates
    chorus.helpers = {
        ifAdmin: function(block) {
            var user = chorus && chorus.session && chorus.session.user();
            if (user && user.get("admin")) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        ifAdminOr: function(flag, block) {
            var user = chorus && chorus.session && chorus.session.user();
            if ((user && user.get("admin")) || flag) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        ifCurrentUserNameIs: function(username, block) {
            var user = chorus && chorus.session && chorus.session.user();
            if (user && user.get("username") == username) {
                return block(this);
            } else if (block.inverse) {
                return block.inverse(this);
            }
        },

        ifAll: function() {
            var args = _.toArray(arguments);
            var block = args.pop();
            if (block.length == 0) {
                throw "ifAll expects arguments";
            }
            if (_.all(args, function(arg) {
                return !!arg
            })) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        ifAny: function() {
            var args = _.toArray(arguments);
            var block = args.pop();
            if (block.length == 0) {
                throw "ifAny expects arguments";
            }
            if (_.any(args, function(arg) {
                return !!arg
            })) {
                return block(this);
            } else {
                return block.inverse(this);
            }
        },

        eachFunctionResult: function() {
            var args = _.toArray(arguments);
            var block = args.pop();
            var results = "";
            var attachments = args[0].apply(this);
            _.each(attachments, function(attachment) {
                results += block(attachment);
            });
            return results;
        },

        currentUserName: function(block) {
            return chorus.session.get("username");
        },

        displayNameFromPerson: function(person) {
            return [person.firstName, person.lastName].join(' ')
        },

        displayTimestamp: function(timestamp) {
            var date = Date.parseFromApi(timestamp)
            return date ? date.toString("MMMM d") : "WHENEVER"
        },

        relativeTimestamp: function(timestamp) {
            var date = Date.parseFromApi(timestamp);
            return date ? date.toRelativeTime(60000) : "WHENEVER"
        },

        moreLink: function(collection, max, more_key, less_key) {
            if (collection && collection.length > max) {
                templates.moreLinks = templates.moreLinks || Handlebars.compile(
                    "<ul class='morelinks'>\
                    <li><a class='more' href='#'>{{t more_key count=more_count}}</a></li>\
                    <li><a class='less' href='#'>{{t less_key count=more_count}}</a></li>\
                    </ul>"
                );

                return templates.moreLinks({
                    more_key: more_key,
                    more_count: collection.length - max,
                    less_key: less_key
                });
            } else {
                return "";
            }
        },

        eachWithMoreLink: function(context, max, more_key, less_key, showLast, block) {
            var ret = "";

            if (context && context.length > 0) {
                for (var i = 0, j = context.length; i < j; i++) {
                    if(showLast) {
                        context[i].moreClass = (j >= max && i < (j - max)) ? "more" : "";
                    } else {
                        context[i].moreClass = (i >= max) ? "more" : "";
                    }

                    ret = ret + block(context[i]);
                }
                ret += Handlebars.helpers.moreLink(context, max, more_key, less_key);
            } else {
                ret = block.inverse(this);
            }
            return ret;
        },

        userProfileLink: function(user) {
            return chorus.helpers.linkTo(user.showUrl(), user.displayName(), {'class': 'user'});
        },

        pluralize: function(numberOrArray, key, options) {
            var hash = options && options.hash;
            if (numberOrArray === 1 || numberOrArray.length === 1) {
                return t(key, hash);
            } else {
                if (I18n.lookup(key + "_plural")) {
                    return t(key + "_plural", hash);
                } else {
                    return t(key, hash) + "s";
                }
            }
        },

        fileIconUrl: function(key, size) {
            return chorus.urlHelpers.fileIconUrl(key, size);
        },

        linkTo: function(url, text, attributes) {
            var link = $("<a></a>").attr("href", url).attr(attributes || {})

            link.html(Handlebars.Utils.escapeExpression(text))

            return new Handlebars.SafeString(link.outerHtml());
        },

        spanFor: function(text, attributes) {
            return $("<span></span>").text(text).attr(attributes || {}).outerHtml()
        },

        renderTemplate: function(templateName, context) {
            return new Handlebars.SafeString(window.JST["templates/" + templateName](context));
        },

        renderTemplateIf: function(conditional, templateName, context) {
            if (conditional) {
                return Handlebars.helpers.renderTemplate(templateName, context);
            } else {
                return "";
            }
        },

        hotKeyName: function(hotKeyChar) {
            return _.capitalize(chorus.hotKeyMeta) + " + " + hotKeyChar;
        },

        workspaceUsage: function(percentageUsed, sizeText) {
            var markup = ""
            if (percentageUsed >= 100) {
                markup = '<div class="usage_bar">' +
                    '<div class="used full" style="width: 100%;">' +
                    '<span class="size_text">' + sizeText + '</span>' +
                    '<span class="percentage_text">' + percentageUsed + '%</span>' +
                    '</div>' +
                    '</div>'
            } else {
                if (percentageUsed >= 50) {
                    markup = '<div class="usage_bar">' +
                        '<div class="used" style="width: ' + percentageUsed + '%;">' +
                        '<span class="size_text">' + sizeText + '</span></div>' +
                        '</div>'
                } else {
                    markup = '<div class="usage_bar">' +
                        '<div class="used" style="width: ' + percentageUsed + '%;"></div>' +
                        '<span class="size_text">' + sizeText + '</span>' +
                        '</div>'
                }
            }
            return new Handlebars.SafeString(markup)
        },

        chooserMenu: function(choices, options) {
            options = options.hash;
            var max = options.max || 20;
            choices = choices || _.range(1, max + 1);
            options.initial = options.initial || _.last(choices);
            var selected = options.initial || choices[0];
            var translationKey = options.translationKey || "dataset.visualization.sidebar.category_limit";
            var className = options.className || '';
            var markup = "<div class='limiter " + className + "'><span class='pointing_l'></span>" + t(translationKey) + " &nbsp;<a href='#'><span class='selected_value'>" + selected + "</span><span class='triangle'></span></a><div class='limiter_menu_container'><ul class='limiter_menu " + className + "'>";
            _.each(choices, function(thing) {
                markup = markup + '<li>' + thing + '</li>';
            });
            markup = markup + '</ul></div></div>'
            return new Handlebars.SafeString(markup);
        },

        sqlDefinition: function(definition) {
            if (!definition) {
                return '';
            }
            definition || (definition = '')
            var promptSpan = $('<span>').addClass('sql_prompt').text(t("dataset.content_details.sql_prompt")).outerHtml();
            var sqlSpan = $('<span>').addClass('sql_content').attr('title', definition).text(definition).outerHtml();
            return new Handlebars.SafeString(t("dataset.content_details.definition", {sql_prompt: promptSpan, sql: sqlSpan}));
        },

        renderTableData: function(tableData) {
            if (tableData && typeof(tableData) =='string') {
                tableData = tableData.trim()
            }
            if (tableData || tableData === 0 || isNaN(tableData)) {
                return tableData
            } else if (tableData === false) {
                return "false";
            } else {
                return "&nbsp;";
            }
        },

        percentage: function(value) {
            var number = Math.pow(10, 2);
            var result = Math.round(value * number) / number;
            return result + "%";
        },

        percentageFromFraction: function(fraction) {
            return chorus.helpers.percentage(fraction * 100);
        },

        round: function(value) {
            if (value > .1) {
                var number = Math.pow(10, 2);
                return Math.round(value * number) / number;
            }

            return value;
        },

        encode: function(value) {
            return encodeURIComponent(value);
        },

        usedInWorkspaces: function(workspaceSet, contextObject) {
            contextObject = contextObject.clone();
            if (!workspaceSet || workspaceSet.length == 0) { return ""; }

            if (!(workspaceSet instanceof chorus.collections.WorkspaceSet)) {
                workspaceSet = new chorus.collections.WorkspaceSet(workspaceSet);

            }

            function linkToContextObject(workspace) {
                contextObject.setWorkspace(workspace);
                return chorus.helpers.linkTo(contextObject.showUrl(), workspace.get('name'), {
                    title: workspace.get('name')
                }).toString()
            }

            var workspaceLink = linkToContextObject(workspaceSet.at(0));

            var result = $("<div></div>").addClass('found_in')
            var otherWorkspacesMenu = chorus.helpers.linkTo('#', t('workspaces_used_in.other_workspaces', {count: workspaceSet.length - 1}), {'class': 'open_other_menu'}).toString()

            result.append(t('workspaces_used_in.body', {workspaceLink: workspaceLink, otherWorkspacesMenu: otherWorkspacesMenu, count: workspaceSet.length }));
            if (workspaceSet.length > 1) {
                var list = $('<ul></ul>').addClass('other_menu');
                _.each(_.rest(workspaceSet.models), function(workspace) {
                    list.append($('<li></li>').html(linkToContextObject(workspace)));
                })
                result.append(list);
            }

            return new Handlebars.SafeString(result.outerHtml());
        },

        usedInTableau: function(tableauWorkbookSet, contextObject) {
            contextObject = contextObject.clone();
            if (!tableauWorkbookSet || tableauWorkbookSet.length == 0) { return ""; }

            if (!(tableauWorkbookSet instanceof chorus.collections.TableauWorkbookSet)) {
                tableauWorkbookSet = new chorus.collections.TableauWorkbookSet(tableauWorkbookSet);

            }

            function linkToContextObject(workbook) {
                return chorus.helpers.linkTo(workbook.get("url"), workbook.get('name'), {
                    title: workbook.get('name'),
                    target: "_blank"
                }).toString()
            }

            var workbookLink = linkToContextObject(tableauWorkbookSet.at(0));

            var result = $("<div></div>").addClass('published_to')
            var otherWorkbooksMenu = chorus.helpers.linkTo('#', t('tableau.other_workbooks', {count: tableauWorkbookSet.length - 1}), {'class': 'open_other_menu'}).toString()

            result.append(t('tableau.body', {workbookLink: workbookLink, otherWorkbooksMenu: otherWorkbooksMenu, count: tableauWorkbookSet.length }));
            if (tableauWorkbookSet.length > 1) {
                var list = $('<ul></ul>').addClass('other_menu');
                _.each(_.rest(tableauWorkbookSet.models), function(workbook) {
                    list.append($('<li></li>').html(linkToContextObject(workbook)));
                })
                result.append(list);
            }

            return new Handlebars.SafeString(result.outerHtml());
        },
        
        attachmentFoundIn: function(model) {
            if (model.workspace()) {
                var workspaceLink = model.workspace().showLink();
                var datasetLink = model.dataset().showLink();
                return t("attachment.found_in.dataset_in_workspace", { workspaceLink: workspaceLink, datasetLink: datasetLink })
            } else {
                var datasetLink = model.dataset().showLink();
                return t("attachment.found_in.dataset_not_in_workspace", { datasetLink: datasetLink })
            }
        },

        datasetLocation: function(dataset, label) {
            label = _.isString(label) ? label : "dataset.from";
            var highlightedDataset = chorus.helpers.withSearchResults(dataset)
            var instance = dataset.instance();
            var schema = dataset.schema();
            var database = schema.database();

            var schemaPieces = [];
            var instanceName = instance.name();
            var databaseName = chorus.helpers.withSearchResults(database).name()
            var schemaName = chorus.helpers.withSearchResults(schema).name()

            if (dataset.get('hasCredentials') === false) {
                schemaPieces.push(instanceName);
                schemaPieces.push(databaseName);
                schemaPieces.push(schemaName);
            } else {
                schemaPieces.push(chorus.helpers.linkTo(instance.showUrl(), instanceName, {"class": "instance"}).toString());
                schemaPieces.push(chorus.helpers.linkTo(database.showUrl(), databaseName, {"class": "database"}).toString());
                schemaPieces.push(chorus.helpers.linkTo(schema.showUrl(), schemaName, {'class': 'schema'}).toString())
            }
            return new Handlebars.SafeString($("<span></span>").html(t(label, {location: schemaPieces.join('.')})).outerHtml());
        },

        displaySearchMatch: function(attributeName) {
            var attr = chorus.helpers.withSearchResults(this).get(attributeName, false);
            if (attr) {
                return new Handlebars.SafeString(attr);
            }
            return attr;
        },

        displaySearchMatchFromSafeField: function(attributeName) {
            var attr = chorus.helpers.withSearchResults(this).get(attributeName, true);
            if (attr) {
                return new Handlebars.SafeString(attr);
            }
            return attr;
        },

        withSearchResults: function(modelOrAttributes) {
            getReal = modelOrAttributes.get || function(attributeName) { return modelOrAttributes[attributeName]; };
            modelOrAttributes = Object.create(modelOrAttributes);

            modelOrAttributes.get =
                function(attributeName, safe) {
                    if (getReal.call(modelOrAttributes, 'highlightedAttributes') && getReal.call(modelOrAttributes, 'highlightedAttributes')[attributeName]) {
                        var attribute = getReal.call(modelOrAttributes, 'highlightedAttributes')[attributeName];
                        return new Handlebars.SafeString(_.isArray(attribute) ? attribute[0] : attribute);
                    } else if (safe) {
                        return new Handlebars.SafeString(modelOrAttributes[attributeName]);
                    } else {
                        return new Handlebars.SafeString(Handlebars.Utils.escapeExpression(getReal.call(modelOrAttributes, attributeName)));
                    }
                };

            return modelOrAttributes;
        },

        humanizedDatasetType: function(dataset, statistics) {
            if (!dataset) { return ""; }
            var keys = ["dataset.types", dataset.type];
            if (statistics && statistics.objectType) {
                keys.push(statistics.objectType);
            }
            else if (dataset.type === "CHORUS_VIEW" || dataset.type === "SOURCE_TABLE")
            {
                keys.push(dataset.objectType);
            }
            else {
                return t("loading");
            }
            var key = keys.join(".");
            return t(key);
        },

        importFrequencyTag: function(frequency) {
            if (!frequency) {
                return '';
            }
            var result = '<span class="tag import_frequency">' +
                '<span class="arrow_left"></span><span class="tag_name">' + Handlebars.Utils.escapeExpression(frequency) + '</span>' +
                '</span>';
            return new Handlebars.SafeString(result);
        },

        importFrequencyForModel: function(model) {
            return model.importFrequency && model.importFrequency() && t("import.frequency." + model.importFrequency().toLowerCase())
        },

        safeT: function() {
            return new Handlebars.SafeString(Handlebars.helpers.t.apply(this, arguments));
        },

        searchResultCommentTitle: function(comment) {
            if (comment.isInsight) {
                return t("search.supporting_message_types.insight");
            }
            if (comment.isComment) {
                return t("search.supporting_message_types.comment");
            }
            if (comment.isCommitMessage) {
                return "";
            }
            if (comment.isColumn) {
                return t("search.supporting_message_types.column");
            }
            if(comment.isColumnDescription) {
                return t("search.supporting_message_types.column_description");
            }
            if(comment.isTableDescription) {
                return t("search.supporting_message_types.table_description");
            }
            return t("search.supporting_message_types.note");
        },

        renderErrors: function(serverErrors) {
            var output = ["<ul>"];
            var errorMessages = chorus.Mixins.ServerErrors.serverErrorMessages.call({serverErrors: serverErrors});

            _.each(errorMessages, function(message) {
                output.push("<li>" + message + "</li>");
            });

            output.push("</ul>");
            return new Handlebars.SafeString(output.join(""));
        }
    };

    _.each(chorus.helpers, function(helper, name) {
        Handlebars.registerHelper(name, helper);
    });
})();
