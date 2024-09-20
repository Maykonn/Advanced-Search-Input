(function(global, $) {
    const AdvancedSearch = {
        init(config) {
            // Default configuration
            const defaultConfig = {
                entities: [],
                searchAPI: '/api/advanced-search?filter=',
                advancedSearchContainer: '#advanced-search-container',
                customHTML: null,
                testMode: false,
                runTests: false,
                testIds: [],
                successCallback: this.defaultSuccessCallback.bind(this),
                errorCallback: this.defaultErrorCallback.bind(this)
            };

            // Extend the default configuration with user-provided settings
            this.config = $.extend({}, defaultConfig, config);
            
            // Initialize instance properties
            this.testMode = this.config.testMode;
            this.runTests = this.config.runTests;
            this.testIds = this.config.testIds;
            this.entities = this.config.entities;
            this.searchAPI = this.config.searchAPI;
            this.advancedSearchContainer = this.config.advancedSearchContainer;
            this.customHTML = this.config.customHTML;
            this.successCallback = this.config.successCallback;
            this.errorCallback = this.config.errorCallback;

            // Initialize instance-specific properties
            this.operators = ['=', '!=', '>', '>=', '<', '<=', 'in', 'not in', '~'];
            this.logicalOperators = ['AND', 'OR'];
            this.currentEntity = this.config.currentEntity || this.entities[0]?.name;
            this.currentAttribute = null;
            this.currentAttributeType = null;
            this.currentOperator = null;
            this.entityMap = {};

            // Check if the entities list is empty
            if (!this.entities || this.entities.length === 0) {
                this.errorCallback('Advanced Search: no entities provided', this.entities);
                return;
            }

            // Determine the current entity
            this.entityMap = this.createEntityMap(this.entities);
            this.setupDOM();
            this.bindEvents();
            this.initializeSearchInput();
            this.setupAutocomplete();

            // Update the debug container on page load if test mode is enabled
            if (this.testMode) {
                const initialQuery = $('#search-input').val().trim();
                this.updateDebugContainer(initialQuery);
            }

            // Run tests if enabled
            if (this.runTests) {
                AdvancedSearchTests.run(this.parseQuery, this.config);
            }
        },
        showNotification(type, message) {
            const notification = $('<div class="ui-widget">')
                .append(
                    $('<div class="ui-state-' + (type === 'error' ? 'error' : 'highlight') + ' ui-corner-all" style="margin-top: 20px; padding: 0 .7em;">')
                        .append('<p><span class="ui-icon ui-icon-' + (type === 'error' ? 'alert' : 'info') + '" style="float: left; margin-right: .3em;"></span>' + message + '</p>')
                );

            $('body').append(notification);

            notification.dialog({
                modal: false,
                close: function() {
                    $(this).dialog('destroy').remove();
                },
                show: {
                    effect: "fadeIn",
                    duration: 300
                },
                hide: {
                    effect: "fadeOut",
                    duration: 300
                },
                open: function() {
                    setTimeout(() => {
                        notification.dialog('close');
                    }, 3000); // Auto-close after 3 seconds
                }
            });
        },
        defaultSuccessCallback(message, data) {
            this.showNotification('success', message);
            if (this.testMode) {
                console.log("Advanced Search defaultSuccessCallback: Success data", data);
            }
        },
        defaultErrorCallback(message, data) {
            this.showNotification('error', message);
            if (this.testMode) {
                console.error("Advanced Search defaultErrorCallback: Error data", data);
            }
        },
        createEntityMap(entities) {
            const entityMap = {};
            entities.forEach(entity => {
                entityMap[entity.name] = entity;
            });
            return entityMap;
        },
        setupDOM() {
            const defaultHTML = `
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search...">
                    <span id="help-icon">❓</span>
                </div>
                <div class="button-group">
                    <button id="search-button" class="action-button">Search</button>
                    <button id="clear-button" class="action-button">Clear Query</button>
                </div>
                <div id="help-container">
                    <p>Help content goes here...</p>
                </div>
            `;

            const htmlContent = this.customHTML || defaultHTML;
            $(this.advancedSearchContainer).html(htmlContent);

            // Add debug container if test mode is enabled
            if (this.testMode) {
                $(this.advancedSearchContainer).append(`
                    <div id="debug-container">
                        <strong>DEBUG MODE: TRUE</strong>
                    </div>
                `);
            }
        },
        formatQuery(query) {
            const reservedWords = ['AND', 'OR', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET'];
            const regex = new RegExp(`\\b(${reservedWords.join('|')})\\b`, 'gi');
            return query.replace(regex, '\n<span class="reserved-word">$1</span>').trim();
        },
        updateDebugContainer(query, requestContent = null) {
            if (this.testMode) {
                const formattedQuery = this.formatQuery(query).replace(/\n/g, '<br>');
                const debugContent = `
                    <strong>DEBUG MODE: TRUE</strong>
                    <pre>${formattedQuery}</pre>
                    ${requestContent ? `<strong>Request Content:</strong><pre>${requestContent}</pre>` : ''}
                `;
                $('#debug-container').html(debugContent);
            }
        },
        bindEvents() {
            const self = this;

            $('#clear-button').on('click', function() {
                self.clearQuery();
            });

            $('#search-input').on('blur', function() {
                const query = $(this).val().trim();
                self.updateUrl(query, false);
            });

            $('#search-input').on('input', self.debounce(() => {
                const value = $('#search-input').val().trim();
                const terms = value.split(/\s+/).filter(Boolean);
                const lastTerm = terms[terms.length - 1];

                if (self.operators.includes(lastTerm) && self.currentAttributeType) {
                    self.handleOperatorSelection(terms, lastTerm);
                } else if (lastTerm === '' || self.operators.includes(lastTerm) || self.logicalOperators.includes(lastTerm)) {
                    $('#search-input').autocomplete('search', ' ');
                }

                self.updateUrl(value, true);
                
                // Update the debug container with the current query
                self.updateDebugContainer(value);
            }, 500));

            $('#search-button').on('click', function() {
                const query = $('#search-input').val().trim();
                self.fetchResults(query);
                self.updateUrl(query, true);
            });

            $('#help-icon').on('click', function() {
                self.showHelp();
            });

            $('#help-container').on('click', 'li.clickable', function(event) {
                self.addToQuery($(this).data('value'), event);
            });

            window.addEventListener('popstate', function(event) {
                const urlParams = new URLSearchParams(window.location.search);
                const queryString = urlParams.get('query');
                if (queryString) {
                    $('#search-input').val(decodeURIComponent(queryString).trim());
                } else {
                    $('#search-input').val('');
                }
            });
        },
        initializeSearchInput() {
            const urlParams = new URLSearchParams(window.location.search);
            const queryString = urlParams.get('query');
            $('#search-input').val(queryString ? decodeURIComponent(queryString).trim() : '');
        },
        clearQuery() {
            $('#search-input').val('');
            this.updateUrl('', true);
        },
        debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },
        updateUrl(query, pushState) {
            const newUrl = `${window.location.origin}${window.location.pathname}?query=${encodeURIComponent(query)}`;
            if (pushState) {
                window.history.pushState({ path: newUrl }, '', newUrl);
            } else {
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
        },
        showHelp() {
            let helpContent = `<div class="help-content">`;

            // Operators Section
            helpContent += `<h4 class="help-header">Operators:</h4>
                <ul class="help-list">`;
            this.operators.forEach(op => {
                helpContent += `<li class="clickable" data-value="${op}">${op}</li>`;
            });
            helpContent += `</ul>`;

            // Logical Operators Section
            helpContent += `<h4 class="help-header">Logical Operators:</h4>
                <ul class="help-list">`;
            this.logicalOperators.forEach(op => {
                helpContent += `<li class="clickable" data-value="${op}">${op}</li>`;
            });
            helpContent += `</ul>`;

            // Main Entity Attributes
            helpContent += `<h4 class="help-header">${this.currentEntity} Attributes:</h4>
                <ul class="help-list">`;
            for (const attr in this.entityMap[this.currentEntity].attributes) {
                const rules = this.entityMap[this.currentEntity].attributes[attr].rules.join(', ');
                helpContent += `<li class="clickable" data-value="${attr}">${attr} (${this.entityMap[this.currentEntity].attributes[attr].type})<br><small>Rules: ${rules}</small></li>`;
            }
            helpContent += `</ul>`;

            // Relations and Related Entity Attributes
            if (this.entityMap[this.currentEntity].relations && Object.keys(this.entityMap[this.currentEntity].relations).length > 0) {
                helpContent += `<h5>Relations:</h5><ul class="help-list">`;
                for (const rel in this.entityMap[this.currentEntity].relations) {
                    const relation = this.entityMap[this.currentEntity].relations[rel];
                    helpContent += `<li class="informative">${rel} (${relation.type} with ${relation.model.charAt(0).toUpperCase() + relation.model.slice(1)})</li>`;
                    const relatedEntity = relation.model;

                    // Display Attributes of the Related Entity
                    helpContent += `<h5 class="help-header">${relatedEntity} Attributes:</h5><ul class="help-list">`;
                    for (const attr in this.entityMap[relatedEntity].attributes) {
                        const rules = this.entityMap[relatedEntity].attributes[attr].rules.join(', ');
                        helpContent += `<li class="clickable" data-value="${rel}.${attr}">${attr} (${this.entityMap[relatedEntity].attributes[attr].type})<br><small>Rules: ${rules}</small></li>`;
                    }
                    helpContent += `</ul>`;

                    // Check if there are comments related to the posts
                    if (this.entityMap[relatedEntity].relations && this.entityMap[relatedEntity].relations['comments']) {
                        helpContent += `<h5 class="help-header">${relatedEntity} Comments Attributes:</h5><ul class="help-list">`;
                        const commentRel = this.entityMap[relatedEntity].relations['comments'];
                        for (const attr in this.entityMap[commentRel.model].attributes) {
                            const rules = this.entityMap[commentRel.model].attributes[attr].rules.join(', ');
                            helpContent += `<li class="clickable" data-value="${rel}.comments.${attr}">${attr} (${this.entityMap[commentRel.model].attributes[attr].type})<br><small>Rules: ${rules}</small></li>`;
                        }
                        helpContent += `</ul>`;
                    }
                }
                helpContent += `</ul>`;
            }

            // Pagination Section
            helpContent += `<h4 class="help-header">Pagination:</h4>
                <ul class="help-list">
                    <li class="clickable" data-value="LIMIT">LIMIT</li>
                    <li class="clickable" data-value="OFFSET">OFFSET</li>
                </ul>`;
            
            // Sorting Section
            helpContent += `<h4 class="help-header">Sorting:</h4>
                <ul class="help-list">
                    <li class="clickable" data-value="ORDER BY">ORDER BY</li>
                    <li class="clickable" data-value="ASC">ASC</li>
                    <li class="clickable" data-value="DESC">DESC</li>
                </ul>`;

            helpContent += `</div>`;

            $('#help-container').html(helpContent).toggle();
        },
        fetchResults(query) {
            const { filters, sort, limit, offset } = this.parseQuery(query);

            const filterString = JSON.stringify(filters);
            const sortString = sort.length ? `&sort=${encodeURIComponent(JSON.stringify(sort))}` : '';
            const limitString = limit ? `&limit=${limit}` : '';
            const offsetString = offset ? `&offset=${offset}` : '';

            const url = `${this.searchAPI}${encodeURIComponent(filterString)}${sortString}${limitString}${offsetString}`;

            // Display the query and request content in the debug container
            this.updateDebugContainer(query, JSON.stringify({ filters, sort, limit, offset }, null, 2));

            $.ajax({
                url: url,
                type: 'GET',
                success: (data) => {
                    this.successCallback('Advanced Search: Data fetched successfully.', data);
                },
                error: (xhr, ajaxOptions, thrownError) => {
                    this.errorCallback('Advanced Search: An error occurred while fetching results. Please try again.', xhr.responseText);
                }
            });
        },
        parseQuery(query) {
            const filters = [];
            const sort = [];
            let limit = null;
            let offset = null;

            function processFilter(term, andor = null) {
                const parts = term.match(/(\w+(\.\w+)*)(\s*(=|!=|>|>=|<|<=|in|not in|~))\s*("(.*?)"|\d+|\d{4}-\d{2}-\d{2})/);
                if (parts) {
                    const property = parts[1].trim();
                    const operator = parts[4].trim();
                    let value = parts[5].trim();

                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }

                    filters.push({ property, operator, value, andor: andor ? andor.toLowerCase() : null });
                }
            }

            function processSort(orderByClause) {
                const parts = orderByClause.split(',').map(t => t.trim());
                parts.forEach(part => {
                    const [property, direction] = part.split(/\s+/);
                    sort.push({ property: property.trim(), direction: (direction || 'ASC').toUpperCase().trim() });
                });
            }

            function processLimit(limitClause) {
                limit = parseInt(limitClause, 10);
            }

            function processOffset(offsetClause) {
                offset = parseInt(offsetClause, 10);
            }

            // Split the query by reserved keywords to isolate ORDER BY, LIMIT, and OFFSET clauses
            const querySections = query.split(/\s*(ORDER BY|LIMIT|OFFSET)\s*/i);
            let remainingQuery = querySections[0];

            for (let i = 1; i < querySections.length; i += 2) {
                const clause = querySections[i].toUpperCase();
                const value = querySections[i + 1];

                if (clause === 'ORDER BY') {
                    processSort(value);
                } else if (clause === 'LIMIT') {
                    processLimit(value);
                } else if (clause === 'OFFSET') {
                    processOffset(value);
                }

                // Remove the clause from the remaining query
                remainingQuery = remainingQuery.replace(new RegExp(`\\s*${clause}\\s*${value}`, 'i'), '');
            }

            // Process filters if there's anything left to process
            if (remainingQuery.trim()) {
                const filterSections = remainingQuery.split(/\s+(AND|OR)\s+/i);
                let currentAndOr = null;
                for (const section of filterSections) {
                    if (section.toUpperCase() === 'AND' || section.toUpperCase() === 'OR') {
                        currentAndOr = section.toLowerCase();
                    } else {
                        processFilter(section, currentAndOr);
                        currentAndOr = null;
                    }
                }
            }
            
            return { filters, sort, limit, offset };
        },
        addToQuery(value) {
            const currentQuery = $('#search-input').val().trim();
            const terms = currentQuery.split(/\s+/).filter(Boolean);

            const upperValue = value.toUpperCase();
            const isOrderBy = upperValue === 'ORDER BY';
            const isPagination = upperValue === 'LIMIT' || upperValue === 'OFFSET';
            const isSortDirection = upperValue === 'ASC' || upperValue === 'DESC';
            const isOrder = upperValue === 'ORDER';

            const lastTerm = terms[terms.length - 1];
            const preLastTerm = terms[terms.length - 2];

            const containsTerm = term => terms.some(t => t.toUpperCase() === term);

            if (isOrderBy) {
                const existingOrderByIndex = terms.findIndex((term, index, array) =>
                    term.toUpperCase() === 'ORDER' && array[index + 1]?.toUpperCase() === 'BY'
                );

                if (existingOrderByIndex === -1) {
                    if (lastTerm?.toUpperCase() === 'ORDER') {
                        terms[terms.length - 1] = 'ORDER BY';
                    } else {
                        terms.push('ORDER BY');
                    }
                }
            } else if (isPagination) {
                if (!containsTerm(upperValue)) {
                    terms.push(value);
                }
            } else if (isSortDirection) {
                if (!containsTerm('ASC') && !containsTerm('DESC')) {
                    terms.push(value);
                }
            } else {
                if (isOrder && lastTerm?.toUpperCase() === 'ORDER' && preLastTerm?.toUpperCase() !== 'BY') {
                    return;
                }

                if (lastTerm?.toUpperCase() !== upperValue) {
                    terms.push(value);
                }
            }

            const newQuery = terms.join(' ').trim();
            $('#search-input').val(newQuery).focus();
        },
        showDateTimePicker(terms, operatorIndex) {
            const input = $('<input>').appendTo('body').css({
                position: 'absolute',
                top: -9999,
                left: -9999
            });

            input.datepicker({
                onSelect: function(dateText) {
                    const operator = terms[operatorIndex];
                    terms.splice(operatorIndex, 1);

                    terms.splice(operatorIndex + 1, 0, `"${dateText}"`);

                    terms.splice(operatorIndex, 0, operator);

                    $('#search-input').val(terms.join(' '));
                    input.datepicker('destroy').remove();
                },
                beforeShow: function(input, inst) {
                    setTimeout(() => {
                        $(inst.dpDiv).css({
                            top: $('#search-input').offset().top + $('#search-input').outerHeight(),
                            left: $('#search-input').offset().left,
                            maxWidth: '90%',
                            zIndex: 1000
                        });
                    }, 0);
                },
                onClose: function() {
                    input.datepicker('destroy').remove();
                }
            }).datepicker('show');
        },
        handleOperatorSelection(terms, operator) {
            if (terms.length < 2) return;

            const lastTerm = terms[terms.length - 1];
            const previousTerm = terms[terms.length - 2];

            const relatedParts = previousTerm.split('.');
            const relatedEntityName = this.getRelatedEntityName(relatedParts);

            const attribute = relatedParts.length > 1 ? relatedParts[relatedParts.length - 1] : previousTerm;

            const relatedEntity = this.entityMap[relatedEntityName];
            
            if (!relatedEntity) {
                return;
            }

            const attributeType = relatedEntity.attributes[attribute]?.type;

            if (!attributeType) {
                return;
            }

            this.currentAttributeType = attributeType;

            if (attributeType === 'datetime' || attributeType === 'date') {
                this.showDateTimePicker(terms, terms.length - 1);
            } else if (attributeType !== 'integer') {
                terms.push('""');
                const input = document.getElementById('search-input');
                setTimeout(() => {
                    input.value = terms.join(' ').trim();
                    input.selectionStart = input.selectionEnd = input.value.length - 1;
                }, 0);
            }
        },
        getRelatedEntityName(parts) {
            let entity = this.entityMap[this.currentEntity];
            for (let i = 0; i < parts.length - 1; i++) {
                const relation = parts[i];
                if (entity && entity.relations && entity.relations[relation]) {
                    entity = this.entityMap[entity.relations[relation].model];
                } else {
                    return null;
                }
            }
            return entity ? entity.name : null;
        },
        getFullRelation(parts) {
            let entity = this.entityMap[this.currentEntity];
            let fullRelation = [];
            for (let i = 0; i < parts.length - 1; i++) {
                const relation = parts[i];
                if (entity && entity.relations && entity.relations[relation]) {
                    entity = this.entityMap[entity.relations[relation].model];
                    fullRelation.push(relation);
                } else {
                    return null;
                }
            }
            return fullRelation.length > 0 ? fullRelation.join('.') : null;
        },
        handleAttributeSelection(selectedValue, terms) {
            const relatedParts = selectedValue.split('.');
            const relatedEntityName = this.getRelatedEntityName(relatedParts);
            if (!relatedEntityName) {
                return terms;
            }
            const attribute = relatedParts.length > 1 ? relatedParts[relatedParts.length - 1] : selectedValue;
            this.currentAttribute = selectedValue;
            this.currentAttributeType = this.entityMap[relatedEntityName]?.attributes[attribute]?.type;

            if (terms.length && !this.logicalOperators.includes(terms[terms.length - 1]) && !this.operators.includes(terms[terms.length - 1])) {
                terms.pop();
            } else if (!terms.length) {
                // Special case for the first attribute
                this.currentAttributeType = this.entityMap[this.currentEntity].attributes[selectedValue]?.type;
            }
            terms.push(selectedValue);

            return terms;
        },
        // Autocomplete for search input
        setupAutocomplete() {
            const self = this;
            $('#search-input').autocomplete({
                source: function(request, response) {
                    const term = request.term.split(/\s+/).pop();
                    const parts = term.split('.');
                    const isRelation = parts.length > 1;

                    let entity = self.entityMap[self.currentEntity];
                    let suggestions = [];

                    if (!entity) {
                        response([]);
                        return;
                    }

                    if (isRelation || parts.length === 1) {
                        const fullRelation = self.getFullRelation(parts);
                        const lastPart = parts[parts.length - 1].toLowerCase();
                        
                        if (fullRelation) {
                            const relatedEntityName = self.getRelatedEntityName(parts);
                            if (relatedEntityName) {
                                const relatedAttributes = self.entityMap[relatedEntityName]?.attributes || {};
                                const relatedRelations = Object.keys(self.entityMap[relatedEntityName].relations || {}).map(rel => `${fullRelation}.${rel}.`);
                                suggestions = Object.keys(relatedAttributes).map(attr => `${fullRelation}.${attr}`)
                                    .concat(relatedRelations);
                            }
                        } else {
                            const attributes = self.entityMap[self.currentEntity].attributes;
                            const relations = Object.keys(self.entityMap[self.currentEntity].relations).map(rel => `${rel}.`);
                            suggestions = Object.keys(attributes)
                                .concat(relations)
                                .concat(self.operators)
                                .concat(['ORDER BY', 'ASC', 'DESC'])
                                .concat(self.logicalOperators)
                                .concat(['LIMIT', 'OFFSET']);
                        }

                        suggestions = suggestions.filter(suggestion => suggestion.toLowerCase().includes(lastPart));
                    }

                    const results = $.ui.autocomplete.filter(suggestions, term);
                    response(results.slice(0, 10));
                },
                focus: function() {
                    return false;
                },
                select: function(event, ui) {
                    let terms = $('#search-input').val().trim().split(/\s+/).filter(Boolean);
                    const selectedValue = ui.item.value;
                    const noCommaTerms = ['ASC', 'DESC', 'LIMIT', 'OFFSET'];
                    
                    // Remove the last term (partial term) and replace with the selected value only if it's a relation
                    if (selectedValue.endsWith('.')) {
                        terms.pop();
                    }

                    // Get the ORDER BY position in the query
                    const orderByIndex = terms.findIndex((term, index, array) => 
                        term.toUpperCase() === 'ORDER' && array[index + 1] && array[index + 1].toUpperCase() === 'BY'
                    );

                    // Check if the last terms are "ORDER BY" and append the selected attribute
                    if (orderByIndex !== -1) {
                        // Check if there is already an attribute after "ORDER BY"
                        if (terms[orderByIndex + 2] && terms[orderByIndex + 2] !== 'BY') {
                            // Remove the partial term (the term typed by the user) if it matches with the starting string of selected value OR with the ASC, DESC words
                            if (selectedValue.startsWith(terms[terms.length - 1]) || noCommaTerms.includes(selectedValue.toUpperCase())) {
                                terms.pop();
                            }
                        
                            let orderByAttributesSeparator = ',';
                            
                            // Will this be the first attribute following ORDER BY
                            // OR is there a comma after the attribute e.g: "ORDER BY username,"?
                            if (!terms[orderByIndex + 2] || terms[terms.length - 1].endsWith(',')) {
                                orderByAttributesSeparator = '';
                            }
                            
                            terms.push(orderByAttributesSeparator, selectedValue);
                        } else {
                            // Add the selected attribute after "ORDER BY"
                            terms.splice(orderByIndex + 2, 0, selectedValue);
                        }
                        
                        // Continue with the autocomplete suggestions opened in case the user selected a relation.
                        // This facilitates deeper attributes selection in the relation chain.
                        if (selectedValue.endsWith('.')) {
                            $('#search-input').val(terms.join(' ').trim());
                            setTimeout(() => {
                                $('#search-input').autocomplete('search', terms.join(' '));
                            }, 0);
                        }
                    } else {
                        if (selectedValue.endsWith('.')) {
                            if (terms.length > 0 && !self.logicalOperators.includes(terms[terms.length - 1]) && !self.operators.includes(terms[terms.length - 1])) {
                                terms.push('AND');
                            }
                            terms.push(selectedValue);
                            // Continue with the autocomplete suggestions opened in case the user selected a relation.
                            // This facilitates deeper attributes selection in the relation chain.
                            $('#search-input').val(terms.join(' ').trim());
                            setTimeout(() => {
                                $('#search-input').autocomplete('search', terms.join(' '));
                            }, 0);
                        } else if (self.logicalOperators.includes(selectedValue)) {
                            if (terms.length > 0 && !self.logicalOperators.includes(terms[terms.length - 1])) {
                                terms.pop();
                            }
                            terms.push(selectedValue);
                            $('#search-input').val(terms.join(' ').trim());
                            return false;
                        } else if (self.operators.includes(selectedValue)) {
                            if (terms.length > 0 && !self.operators.includes(terms[terms.length - 1])) {
                                if (terms.length > 1 && (self.logicalOperators.includes(terms[terms.length - 2]) || self.operators.includes(terms[terms.length - 2]))) {
                                } else if (terms.length === 1) {
                                    const firstAttribute = terms[0];
                                    self.currentAttributeType = self.entityMap[self.currentEntity].attributes[firstAttribute]?.type;
                                } else {
                                    terms.pop();
                                }
                            }
                            terms.push(selectedValue);
                            $('#search-input').val(terms.join(' ').trim());

                            const previousTerm = terms[terms.length - 2];
                            if (previousTerm && (self.currentAttributeType === 'datetime' || self.currentAttributeType === 'date')) {
                                self.showDateTimePicker(terms, terms.length - 1);
                            }

                            return false;
                        } else {
                            terms = self.handleAttributeSelection(selectedValue, terms);
                        }
                    }
                    
                    // Join terms into a string while ensuring spaces are added after commas and no comma before certain terms
                    const query = terms.reduce((acc, term, index) => {
                        if (term === ',') {
                            // Check if the next term is in the noCommaTerms list
                            if (index + 1 < terms.length && noCommaTerms.includes(terms[index + 1].toUpperCase())) {
                                return acc + ' ';
                            }
                            return acc + term + ' ';
                        } else if (index > 0 && terms[index - 1] === ',') {
                            return acc + term;
                        } else {
                            return acc + ' ' + term;
                        }
                    }, '').trim();

                    $('#search-input').val(query);
                    return false;
                }
            });
        }
    };

    global.AdvancedSearch = AdvancedSearch;
}(window, jQuery));
