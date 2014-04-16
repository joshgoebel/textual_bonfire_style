# Copyright © 2010 - 2013 Josh Goebel

# Textual API hooks
Textual.viewFinishedLoading = -> Bonfire.boot()
Textual.viewFinishedReload = -> Bonfire.boot()
Textual.handleEvent = (event) -> Bonfire.handleEvent event
Textual.newMessagePostedToView = (lineNumber) -> Bonfire.message lineNumber
Textual.topicBarValueChanged = -> Bonfire.topic()


Bonfire =
  boot: ->
    Bonfire.booting ||= setTimeout () ->
      Bonfire.renderer = new Renderer($("#body_home"))
    , 25
  message: (lineNumber) ->
    Bonfire.renderer.message lineNumber, 0 if Bonfire.renderer
  topic: ->
    console.log "topicBarValueChanged"
    Bonfire.renderer.fixup_topic()
  handleEvent: (event) ->
    console.log "event: #{event}"
    if Bonfire.renderer.hello[event]
      Bonfire.renderer.hello[event]()

# our custom render code

class Hello
  constructor: (@table) ->
    @div = $("#hello")
    @summary = $("#status")
    @hidden = false
    @table.hide()
    @render()
  render: ->
    channel = $("html").attr("channelname")
    if channel # reset to defaults (in case of part mostly)
      @text("You have not joined this channel yet.")
    # 3.0 status api
    return unless app.serverIsConnected
    @summary.hide()
    if not app.serverIsConnected()
      @text("You have not yet connected to the server.")
      @status("Not connected to server.")
    else if channel and not app.channelIsJoined()
      @status("Not joined to channel.")
    else if app.channelIsJoined()
      @text("No chatter on this channel yet.")
  status: (x) ->
    @summary.show() if @hidden
    @summary.find("p").html(x)
  show: ->
    @hidden = false
    @div.show()
    $("#topic_bar").hide()
  text: (x) ->
    @div.find("p").html(x)
  hide: ->
    return if @hidden
    if @table.find(".line").length == 0
      return
    @table.show()
    @hidden = true
    @div.hide()
    $("#topic_bar").show()
    @render() # we may need to render status
  rerender: ->
    # This is needed until the pull request goes thru because state information is not
    # correct until AFTER the event has been fired
    # https://github.com/Codeux/Textual/pull/410
    setTimeout (=> @render()), 25
  # events
  serverDisconnected: -> @rerender()
  serverConnected: -> @rerender()
  channelJoined: -> @rerender()
  channelParted: -> @rerender()
  # because channelJoined is not reliable
  # channelMemberAdded: -> @rerender()

class Renderer
  constructor: (@table) ->
    @hello = new Hello(@table);
    @draw()
    @same_nick = 0
    @no_time = 0
  draw_done: (final) ->
    @hello.hide()
    Textual.scrollToBottomOfView()
    @cap_link_width()
    @setup_cap_links() # re-entrant
    @fixup_topic()
  fixup_topic: ->
    @table.css "margin-top": $("#topic_bar").height() + "px"
  draw: ->
    @drawing = true
    @decay ||= 25
    lines = @table.find(".line")
    raw_lines = @table.find(".line.raw")
    raw_lines.each (i, o) =>
      num=o.id.replace("line","")
      @message num, 0
    if lines.length > 0
      @draw_done()
    @decay *= 2
    unless @decay > 15000
      setTimeout () =>
        @draw()
      , @decay
    else
      @drawing = false
      @draw_done(true)

  # support
  setup_cap_links: ->
    return if @cap_links_setup
    @cap_links_setup = true
    setTimeout ( () => @cap_link_width), 30000
    window.addEventListener "resize", =>
      clearTimeout @resize.timeoutID if @resize
      @resize = setTimeout () =>
        @cap_link_width()
      , 250
  cap_link_width: ->
    # console.log "cap_link_width"
    column = @table.find("div.line:first-child div").first()
    width = 0
    # if we have any columns in the table, use those
    if column.length > 0
      # use offsetWidth to avoid needing the full jquery library
      width=$(window).width() - column[0].offsetWidth;
      width = Math.ceil(width*0.85)
    else
      width = Math.ceil($(window).width()*0.6)
    width = 200 if width==0
    # look for our fixes stylesheet
    style_fixes = $("head style#fixes")
    if style_fixes.length==0 # if we can't find it then, create it
      style_fixes=$("<style id='fixes'>").appendTo($("head"))
    css=".chatlog .line a { max-width:#{width}px; }\n"
    left_column = if column[0] then column[0].offsetWidth else 120
    # smart minimum
    left_column = 120 if left_column < 100
    left_column = 150 if left_column > 150
    right_column = $(window).width() - left_column - 8
    # console.log "window width", $(window).width()
    # css+="table.bf { max-width: #{$(window).width() }px !important }\n"
    css+="div.chatlog .line div:first-child { width: " + left_column + "px !important }\n"
    css+="div.chatlog .line div.last-child { width: " + right_column + "px !important }\n"
    css+="div.chatlog { width: " + $(window).width() + "px !important }";
    style_fixes.html css
    null

  # individual line type routines
  time: (s, opts) ->
    ts = new Date
    diff = 5
    if @last_time
      diff=(ts-@last_time) / 1000 / 60; # minutes
    # try and give preference to actual messages (looks better visually)
    if diff < 7 and opts.before.attr("type")!="privmsg"
      @no_time += 1
      return
    s = s.replace /^0/, ""
    # if a new window or haven't printed a timestamp in the past 5 minutes
    # or if we're doing a reload
    if diff >= 5 or ( diff < 0.1 and @no_time > 10 and s != @last_time_string)
      row = $("<div class='line time'><div class='blank'></div><div class='msg'>" + s + "</div></div>")
      # nick doesn't count as a repeat if a timestamp separates it
      Bonfire.last_nick = null
      row.insertBefore(opts.before)
      @last_time = ts
      @last_time_string = s
      @no_time = 0
    else
      @no_time += 1
  line: (num) ->
    @table.find("#line#{num}")
  fix_really_long_words: (row) ->
    msg = row.find "span.message"
    txt = row.text()
    if txt.length > 100
      words = txt.split " "
      for word in words
        if word.length > 100
          msg.css "word-break": "break-all"
          break
      # so we don't aggregate results (coffeescript)
      null
  message: (lineNumber, repeat) ->
    # console.log "process line: #{lineNumber}"
    row = @line(lineNumber)

    @hello.hide()

    # HACK - keep trying until we have it
    unless row[0]
      console.warn "missing #{lineNumber}, retrying"
      if repeat > 5
        console.warn "bailing, too many tries for #{lineNumber}"
        return
      setTimeout () =>
        @message(lineNumber, repeat+1)
      ,50
      return

    # console.log "message() line #{lineNumber}"

    # render time
    time = row.find("span.time")
    @time time.html(), before: row
    time.remove()

    @fix_really_long_words row
    # mark this row as processed
    row.removeClass "raw"

    # hide same nick in a row
    sender = row.find("span.sender")
    nick = sender.attr("nick")
    if nick != Bonfire.last_nick or @same_nick > 7
      Bonfire.last_nick = nick
      @same_nick = 0
      if nick and nick.length > 13
        sender.css "font-size": "0.85em"
        sender.parent().css "padding-top": "6px"
    else
      @same_nick += 1
      sender.hide()


window.BonfireHelpers =
  highlight_nick: (nick) ->
    user_msgs = $(".nick[data-nick=\"#{nick}\"]")
    user_msgs.each (idx, msg) =>
      $(msg).addClass "nick-highlighted"


  unhighlight_nick: (nick) ->
    user_msgs = $(".nick[data-nick=\"#{nick}\"]")
    user_msgs.each (idx, msg) =>
      $(msg).removeClass "nick-highlighted"