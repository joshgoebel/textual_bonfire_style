// Generated by CoffeeScript 1.3.3
(function() {

  this.Renderer = (function() {

    function Renderer(table) {
      this.table = table;
      this.draw();
      this.same_nick = 0;
      this.no_time = 0;
      this.hello = true;
    }

    Renderer.prototype.draw_done = function(final) {
      Textual.scrollToBottomOfView();
      this.hide_hello();
      this.cap_link_width();
      return this.setup_cap_links();
    };

    Renderer.prototype.hide_hello = function() {
      if (this.table.find(".line").length === 0) {
        return;
      }
      $("#hello").hide();
      this.hello = false;
      return $("#topic_bar").show();
    };

    Renderer.prototype.draw = function() {
      var lines,
        _this = this;
      this.drawing = true;
      this.decay || (this.decay = 25);
      lines = this.table.find(".line.raw");
      lines.each(function(i, o) {
        var num;
        num = o.id.replace("line", "");
        num = parseInt(num);
        return _this.message(num);
      });
      if (lines.length > 0) {
        this.draw_done();
      }
      this.decay *= 2;
      if (!(this.decay > 15000)) {
        return setTimeout(function() {
          return _this.draw();
        }, this.decay);
      } else {
        this.drawing = false;
        return this.draw_done(true);
      }
    };

    Renderer.prototype.setup_cap_links = function() {
      var _this = this;
      if (this.cap_links_setup) {
        return;
      }
      this.cap_links_setup = true;
      setTimeout((function() {
        return _this.cap_link_width;
      }), 30000);
      return window.addEventListener("resize", function() {
        if (_this.resize) {
          clearTimeout(_this.resize.timeoutID);
        }
        return _this.resize = setTimeout(function() {
          return _this.cap_link_width();
        }, 250);
      });
    };

    Renderer.prototype.cap_link_width = function() {
      var column, css, left_column, right_column, style_fixes, width;
      column = this.table.find("div.line:first-child div").first();
      width = 0;
      if (column.length > 0) {
        width = $(window).width() - column[0].offsetWidth;
        width = Math.ceil(width * 0.85);
      } else {
        width = Math.ceil($(window).width() * 0.6);
      }
      if (width === 0) {
        width = 200;
      }
      style_fixes = $("head style#fixes");
      if (style_fixes.length === 0) {
        style_fixes = $("<style id='fixes'>").appendTo($("head"));
      }
      css = ".chatlog .line a { max-width:" + width + "px; }\n";
      left_column = column[0] ? column[0].offsetWidth : 120;
      if (left_column < 100) {
        left_column = 120;
      }
      if (left_column > 150) {
        left_column = 150;
      }
      right_column = $(window).width() - left_column - 8;
      css += "div.chatlog .line div.nick { width: " + left_column + "px !important }\n";
      css += "div.chatlog { width: " + $(window).width() + "px !important }";
      style_fixes.html(css);
      return null;
    };

    Renderer.prototype.time = function(s, opts) {
      var diff, row, ts;
      ts = new Date;
      diff = 5;
      if (this.last_time) {
        diff = (ts - this.last_time) / 1000 / 60;
      }
      if (diff < 7 && opts.before.attr("type") !== "privmsg") {
        this.no_time += 1;
        return;
      }
      if (diff >= 5 || (diff < 0.1 && this.no_time > 10 && s !== this.last_time_string)) {
        row = $("<div class='line time'><div class='blank'></div><div class='msg'>" + s + "</div></div>");
        Bonfire.last_nick = null;
        row.insertBefore(opts.before);
        this.last_time = ts;
        this.last_time_string = s;
        return this.no_time = 0;
      } else {
        return this.no_time += 1;
      }
    };

    Renderer.prototype.message = function(lineNumber) {
      var nick, row, sender, time,
        _this = this;
      row = this.table.find("#line" + lineNumber);
      if (this.hello) {
        this.hide_hello();
      }
      if (!row[0]) {
        console.warn("missing " + lineNumber + ", retrying");
        setTimeout(function() {
          return _this.message(lineNumber);
        }, 50);
        return;
      }
      time = row.find("span.time");
      this.time(time.html(), {
        before: row
      });
      time.remove();
      row.removeClass("raw");
      sender = row.find("span.sender");
      nick = sender.attr("nick");
      if (nick !== Bonfire.last_nick || this.same_nick > 7) {
        Bonfire.last_nick = nick;
        this.same_nick = 0;
        if (nick && nick.length > 13) {
          sender.css({
            "font-size": "0.85em"
          });
          return sender.parent().css({
            "padding-top": "6px"
          });
        }
      } else {
        this.same_nick += 1;
        return sender.remove();
      }
    };

    return Renderer;

  })();

}).call(this);
