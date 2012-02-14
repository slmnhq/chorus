// Modified from https://github.com/wdavidw/node-csv-parser
// Module CSV - Copyright David Worms <open@adaltas.com> (BSD Licensed)

var CSV = function() {
    this.lines = [];
    this.state = {
            count: 0,
            countWriten: 0,
            field: '',
            line: [],
            lastC: '',
            quoted: false,
            commented: false,
            buffer: null,
            bufferPosition: 0
        }
}
_.extend(CSV.prototype, {

    defaultReadOptions: {
        delimiter: ',',
        quote: '"',
        escape: '"',
        columns: null,
        flags: 'r',
        trim: false,
        ltrim: false,
        rtrim: false
    },
    writeOptions: {
        delimiter: null,
        quote: null,
        escape: null,
        lineBreaks: null,
        flags: 'w',
        encoding: 'utf8',
        bufferSize: null,
        end: true // Call `end()` on close
    },

    from: function(data, options) {
        this.readOptions = _.extend({}, this.defaultReadOptions, options);
        var self = this;
        if (data instanceof Array) {
            if (this.writeOptions.lineBreaks === null) {
                this.writeOptions.lineBreaks = "\r\n";
            }
            _.each(data, function(line) {
                self.parse(line);
                self.end();
            })
        } else {
            try {
                this.parse(data);
            } catch (e) {
                throw(e);
            }
        }
        this.end();
        return this;
    },

    parse: function(chars) {
        chars = '' + chars;
        for (var i = 0, l = chars.length; i < l; i++) {
            var c = chars.charAt(i);
            switch (c) {
                case this.readOptions.escape:
                case this.readOptions.quote:
                    if (this.state.commented) break;
                    var isEscape = false;
                    if (c === this.readOptions.escape) {
                        // Make sure the escape is really here for escaping:
                        // if escape is same as quote, and escape is first char of a field and it's not quoted, then it is a quote
                        // next char should be an escape or a quote
                        var nextChar = chars.charAt(i + 1);
                        if (!( this.readOptions.escape === this.readOptions.quote && !this.state.field && !this.state.quoted )
                            && ( nextChar === this.readOptions.escape || nextChar === this.readOptions.quote )) {
                            i++;
                            isEscape = true;
                            c = chars.charAt(i);
                            this.state.field += c;
                        }
                    }
                    if (!isEscape && (c === this.readOptions.quote)) {
                        if (this.state.field && !this.state.quoted) {
                            // Treat quote as a regular character
                            this.state.field += c;
                            break;
                        }
                        if (this.state.quoted) {
                            // Make sure a closing quote is followed by a delimiter
                            var nextChar = chars.charAt(i + 1);
                            if (nextChar && nextChar != '\r' && nextChar != '\n' && nextChar !== this.readOptions.delimiter) {
                                throw new Error('Invalid closing quote; found "' + nextChar + '" instead of delimiter "' + this.readOptions.delimiter + '"');
                            }
                            this.state.quoted = false;
                        } else if (this.state.field === '') {
                            this.state.quoted = true;
                        }
                    }
                    break;
                case this.readOptions.delimiter:
                    if (this.state.commented) break;
                    if (this.state.quoted) {
                        this.state.field += c;
                    } else {
                        if (this.readOptions.trim || this.readOptions.rtrim) {
                            this.state.field = this.state.field.trimRight();
                        }
                        this.state.line.push(this.state.field);
                        this.state.field = '';
                    }
                    break;
                case '\n':
                    if (this.state.quoted) {
                        this.state.field += c;
                        break;
                    }
                    if (!this.readOptions.quoted && this.state.lastC === '\r') {
                        break;
                    }
                case '\r':
                    if (this.state.quoted) {
                        this.state.field += c;
                        break;
                    }
                    if (this.writeOptions.lineBreaks === null) {
                        // Auto-discovery of linebreaks
                        this.writeOptions.lineBreaks = c + ( c === '\r' && chars.charAt(i + 1) === '\n' ? '\n' : '' );
                    }
                    if (this.readOptions.trim || this.readOptions.rtrim) {
                        this.state.field = this.state.field.trimRight();
                    }
                    this.state.line.push(this.state.field);
                    this.state.field = '';
                    this.flush();
                    break;
                case ' ':
                case '\t':
                    if (this.state.quoted || (!this.readOptions.trim && !this.readOptions.ltrim ) || this.state.field) {
                        this.state.field += c;
                        break;
                    }
                    break;
                default:
                    if (this.state.commented) break;
                    this.state.field += c;
            }
            this.state.lastC = c;
        }
        return this.state;
    },

    end: function(){
        if (this.state.quoted) {
            throw("Quoted field not terminated")
        } else {
            // dump open record
            if (this.state.field) {
                if(this.readOptions.trim || this.readOptions.rtrim){
                    this.state.field = this.state.field.trimRight();
                }
                this.state.line.push(this.state.field);
                this.state.field = '';
            }
            if (this.state.line.length > 0) {
                this.flush();
            }
        }
    },

    flush: function(){
        if(this.readOptions.columns){
            if(this.state.count === 0 && this.readOptions.columns === true){
                this.readOptions.columns = this.state.line;
                this.state.line = [];
                this.state.lastC = '';
                return;
            }
            var line = {};
            this.readOptions.columns.forEach(function(column, i){
                line[column] = this.state.line[i]||null;
            })
            this.state.line = line;
            line = null;
        }
        var line;
        if(this.transformer){
            transforming = true;
            line = this.transformer(this.state.line, this.state.count);
            transforming = false;
        }else{
            line = this.state.line;
        }
        this.lines.push(line);
        this.state.count++;
        this.state.line = [];
        this.state.lastC = '';
    }
});