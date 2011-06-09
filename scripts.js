// setTimeout(function() { Bonfire.init(); },10)
// $(window).load(function() { Bonfire.init(); })

var Bonfire={
	init: function()
	{
		if (Bonfire.initing)
			return;
		Bonfire.initing=true;
		// evidentally the page needs a second to render first
    // Textual.include_js("jquery.tiny.js");
		Textual.include_js("zepto.tiny.js");
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
    },
	},
	start: function()
	{
	  Bonfire.fixup_zepto();
		body_home=$("#body_home")
		Bonfire.table=$("<tbody/>").appendTo(outer=$("<table class='bf'>"));
		body_home.append(outer);
		//remap body_home
		body_home.attr("id","container");
		Bonfire.table.attr("id","body_home");
		Bonfire.started=true;
		
		Bonfire.redrawing=true;
		// cap the link width based on the window size before we redraw
		Bonfire.cap_link_width();
		Bonfire.redraw();
		Bonfire.redrawing=false;
		// recalculate the link width after resizing the window
		window.addEventListener("resize", Bonfire.cap_link_width);
		// recalculate the link width after we hopefully have some content
		window.setTimeout(Bonfire.cap_link_width, 30000);
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
	redraw: function()
	{
		$("#container div.line").each (function(i) {
			num=this.id.replace("line","");
			num=parseInt(num);
			Textual.newMessagePostedToDisplay(num);
		});	
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
	},
	// back out our changes and prepare for a theme change
	rollback: function()
	{
		var time,when,container,row,kids,col1,col2,line,p,time,sender,message;
		when="";
		container=$("#container");
		Bonfire.table.attr("id",null)
		container.attr('id',"body_home")
		$("tr",Bonfire.table).each(function(i){
			row=$(this);
			kids=row.children();
			col1=kids.first();
			col2=kids.last();
			// fetch time from a time row
			if (row.hasClass("time")) {
				when=col2.html();
				row.remove();
				return;
			}
			if (row[0].id=="mymark") {
				$("<div id='mark'>").appendTo(container);
			}

			// setup a new line
			line=$("<div>").attr("id", this.id).addClass("line");
			line.attr("nick", row.attr("nick"));
			line.attr("type", row.attr("type"));
			p=$("<p>").appendTo(line);
			if (row.hasClass("highlight")) { 
				line.attr("highlight","true"); 
			} else { 
				line.attr("highlight","false"); }
			
			// add time back
			time=$("<span class='time'>").appendTo(p).html(when);
			
			// add sender
			sender=$("<span class='sender'>").appendTo(p).html(col1.html());
			if (row.hasClass("myself")) {
				p.attr("type","myself");
				sender.addClass("myself");
			}
			sender.attr("colornumber",col1.attr("colornumber"));
			sender.attr("identified",col1.attr("identified"));
			sender.attr("type",col1.attr("type"));
			
			sender[0].oncontextmenu = function() { Textual.on_nick() };
			message=$("<span class='message'>").appendTo(p);
			message.html(col2.html());
			message.attr("type", col2.attr("type"));
			container.append(line);
			row.remove();
		});
		Bonfire.table.remove();
	}
};

// render a time stamp every 5 minutes
function render_time(time)
{
	var ts=new Date;
	if (Bonfire.last_time)
		diff=(ts-Bonfire.last_time)/1000/60; // minutes
	// if a new window or haven't printed a timestamp in the past 5 minutes
	if (Bonfire.last_time==null || diff>5)
	{
		row=$("<tr class='time'><td></td><td>" + time + "</td></tr>");
		Bonfire.table.append(row);
		Bonfire.last_time=ts;
	}
}

Textual.newMessagePostedToDisplay=function(lineNumber)
{
	if (!Bonfire.started) {
		Bonfire.init();
		// window.setTimeout( function() { newMessagePostedToDisplay(lineNumber)}, 50);
		return;
	}
	// move the mark
	if (!Bonfire.redrawing)
		Bonfire.move_mark();
	
	var newLine = $("#line" + lineNumber);
	var message=$("span.message", newLine);
	var sndr=$("span.sender", newLine);
	var nick=sndr.html();
	var time=$("span.time", newLine).html();
	var p=newLine.children("p"); // this is where the myself class is set
	render_time(time);
	row=$("<tr>");
	row.attr("nick", newLine.attr("nick"));
	row.attr("class", newLine.attr("class"));
	row.attr("type", newLine.attr("type"));
	if (newLine.attr("highlight")=="true")
		row.addClass("highlight")
	if (p.attr("type")=="myself")
		row.addClass("myself");
	sender=$("<td>").addClass("nick").html(nick);;
	sender.attr("type", sndr.attr("type"));
	sender.attr("colornumber", sndr.attr("colornumber"));
	sender.attr("identified", sndr.attr("identified"));
	if (nick && nick!=Bonfire.last_nick) {
			sender[0].oncontextmenu = function() { Textual.on_nick() }; 
			Bonfire.last_nick=nick;
	} else {
		sender.addClass("hidden");
	}
	msg=$("<td>").html(message.html()).addClass("msg");
	msg.attr("type", message.attr("type"));
	row.append(sender).append(msg);
	Bonfire.table.append(row);
	// rework ids
	id=newLine.attr("id");
	newLine.attr("id",null);
	row.attr("id",id);
	newLine.remove();
	// if (message.indexOf("is listening to")!=-1)
	// {
	// 	newLine.style.display="none";
	// }
	// if (message.indexOf("Teaser profile for ")!=-1)
	// {
	// 	newLine.style.fontSize="12px";
	// 	message.style.color="#999";
	// }
}

Textual.willDoThemeChange = function() { Bonfire.rollback(); }
Textual.doneThemeChange = function() { Bonfire.init(); }

// Textual.on_nick=function() { app.setNick(event.target.parentNode.getAttribute('nick')); }
function on_nick() { app.setNick(event.target.parentNode.getAttribute('nick')); }