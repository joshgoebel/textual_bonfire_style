# Copyright © 2010, 2011, 2012 Josh Goebel

class @Renderer
  constructor: (@table) ->
    @draw()
    @same_nick = 0
    @no_time = 0
    @hello = true
  draw_done: (final) ->
    Textual.scrollToBottomOfView()
    @hide_hello()
    @cap_link_width()
    @setup_cap_links() # re-entrant
  hide_hello: ->
    if @table.find(".line").length == 0
      return
    $("#hello").hide()
    @hello = false
    $("#topic_bar").show()
  draw: ->
    @drawing = true
    @decay ||= 25
    lines = @table.find(".line.raw")
    lines.each (i, o) =>
      num=o.id.replace("line","")
      num=parseInt(num)
      @message(num)
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
    css+="div.chatlog .line div.nick { width: " + left_column + "px !important }\n"
    # css+="table.bf tr td.msg { width: " + right_column + "px !important }\n"
    css+="div.chatlog { width: " + $(window).width() + "px !important }";
    style_fixes.html css
    null
    
  # individual line type routines
  time: (s, opts) ->
    ts = new Date
    diff = 5
    if @last_time
      diff=(ts-@last_time)/1000/60; # minutes
    # try and give preference to actual messages (looks better visually)
    if diff < 7 and opts.before.attr("type")!="privmsg"
      @no_time += 1
      return
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
  message: (lineNumber) ->
    row = @table.find("#line#{lineNumber}")
    
    @hide_hello() if @hello

    # HACK - keep trying until we have it
    unless row[0]
      console.warn "missing #{lineNumber}, retrying"
      setTimeout () =>
        @message(lineNumber)
      ,50
      return
      
    # console.log "message() line #{lineNumber}"

    # render time
    time = row.find("span.time")
    @time time.html(), before: row
    time.remove()
    
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
      sender.remove()