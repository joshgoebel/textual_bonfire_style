// setTimeout(function() { Bonfire.init(); },10)
// $(window).load(function() { Bonfire.init(); })

var Bonfire={
	init: function()
	{
		if (Bonfire.initing)
			return;
		Bonfire.redrawn = 0;
		Bonfire.initing = true;
		// evidentally the page needs a second to render first
    // Textual.include_js("jquery.tiny.js");
    // Textual.include_js("zepto.tiny.js");
    Textual.include_js("zepto8.tiny.js");
		window.setTimeout(Bonfire.start, 25);
	},
	fixup_zepto: function()
	{
	  // have to hack a zepto function becase we are not an IOS device
	  $.fn.offset = function(){
	    var obj;
      if(this.length==0) return null;
      try {
      obj = this[0].getBoundingClientRect();
      } catch (e) { obj = { left:0, top: 0} }
      return {
        left: obj.left + document.body.scrollLeft,
        top: obj.top + document.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    }
	},
	start: function()
	{
	  console.log("start");
	  Bonfire.fixup_zepto();
		Bonfire.dump=$("#body_home");
		Bonfire.table=$("#thelog");
		Bonfire.table.hide();
		//remap body_home
    // body_home.attr("id","container");
    // Bonfire.table.attr("id","body_home");
		Bonfire.started=true;
		
		// cap the link width based on the window size before we redraw
    // Bonfire.cap_link_width();
    Bonfire.redraw();
		// recalculate the link width after resizing the window
    // window.addEventListener("resize", Bonfire.cap_link_width);
		// recalculate the link width after we hopefully have some content
    // window.setTimeout(Bonfire.cap_link_width, 30000);
	},
	cap_link_width:function()
	{
		var width, column, style_fixes;
		column=$("tr:first-child td",Bonfire.table).first();
		// if we have any columns in the table, use those
		if (column.length!=0) {
			// use offsetWidth to avoid needing the full jquery library
			width=$(window).width()-column[0].offsetWidth;
			width=Math.ceil(width*0.85);
		} else {
			width=Math.ceil($(window).width()*0.6); }
		// look for our fixes stylesheet
		style_fixes=$("head style#fixes");
		if (style_fixes.length==0) // if we can't find it then, create it
			style_fixes=$("<style id='fixes'>").appendTo($("head"));		
		css="table.bf td.msg a { max-width:" + width + "px; }\n";
		css+="table.bf { max-width: " + $(window).width() + "px }";
		style_fixes.html(css)
	},
	done_drawing: function()
	{
	  Bonfire.redrawing=false;
	  Bonfire.table.show();
	  Bonfire.cap_link_width();
	  Textual.scrollToBottomOfView();
	  // try it after we have some content
	  window.setTimeout(Bonfire.cap_link_width, 30000);
	  window.addEventListener("resize", Bonfire.cap_link_width);
	},
	redraw: function()
	{
	  Bonfire.redrawing=true;
	  Bonfire.render_nothing = Bonfire.render_nothing || 0;
	  console.log("redraw");
    // console.log(Bonfire.dump.html());
    var lines = Bonfire.dump.find("table tr.line");
		lines.each (function(i) {
		  Bonfire.redrawn += 1;
			num=this.id.replace("line","");
			num=parseInt(num);
			Textual.newMessagePostedToView(num, true);
		});
		if (lines.length==0 && Bonfire.redrawn > 0)
		  Bonfire.render_nothing += 1;
		// keep looping till we've chewed thru the backlog
		if (Bonfire.render_nothing <= 3){
		  window.setTimeout(Bonfire.redraw, 50);
		} else {
		  Bonfire.done_drawing();
		}
	},
	move_mark: function()
	{
		// look for the div mark
		mark=$("#body_home div#mark");
		if (mark.size() > 0)
		{
			mark.remove();
			$("#mymark").remove();
			// and create our own row mark
			row=$("<tr>").attr("id","mymark");
			col=$("<td colspan='2'></td>").appendTo(row);
			Bonfire.table.append(row);
		}
	}
};

// render a time stamp every 5 minutes
function render_time(time)
{
  var row;
	var ts=new Date;
	if (Bonfire.last_time)
		diff=(ts-Bonfire.last_time)/1000/60; // minutes
	// if a new window or haven't printed a timestamp in the past 5 minutes
	if (Bonfire.last_time==null || diff>5)
	{
		row=$("<tr class='time'><td></td><td>" + time + "</td></tr>");
		// nick doesn't count as a repeat if a timestamp separates it
		Bonfire.last_nick=null;
		Bonfire.table.append(row);
		Bonfire.last_time=ts;
	}
}
Textual.newMessagePostedToView=function(lineNumber,backlog)
{
  var row, time;
  // window.console.log("new message posted:" + lineNumber);
	if (!Bonfire.started) {
	  window.console.warn("bonfire is not started yet")
		Bonfire.init();
		return;
	}
	// move the mark
	if (!Bonfire.redrawing)
		Bonfire.move_mark();
	if (Bonfire.redrawing && !backlog)
	  return;
  
  row = Bonfire.dump.find("#line" + lineNumber);
  if (row[0]==null) {
    console.error("can not find line" + lineNumber );
    setTimeout(Bonfire.redraw, 100);
  }
    
  
  // render time
  time = row.find("span.time");
  render_time(time.html());
  time.remove();
  
  // hide same nick in a row
  var sender = row.find("span.sender");
	var nick=sender.html();
	if (nick && nick!=Bonfire.last_nick) {
      // sender[0].oncontextmenu = function() { Textual.on_nick() }; 
			Bonfire.last_nick=nick;
	} else {
		sender.remove();
	}
	
	// highlight our own rows
	var p=row.find("p"); // this is where the myself class is set
	if (p.attr("type")=="myself")
		row.addClass("myself");
		
  // move the row
  row.parent().parent().remove();
  Bonfire.table.append(row);
  // window.console.log("after move");
}

// replace Textual mark with our own
Textual.historyIndicatorAddedToView = function()
{
  Bonfire.move_mark();
}

Textual.viewFinishedLoading = function() 
{ 
  console.log("viewFinishedLoading");
  Bonfire.init(); 
}
  
Textual.viewFinishedReload = function() 
{ 
  console.log("viewFinishedReload");
  Bonfire.init(); 
}