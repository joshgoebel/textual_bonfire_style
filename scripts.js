// setTimeout(function() { Bonfire.init(); },10)
// $(window).load(function() { Bonfire.init(); })

var Bonfire={
	init: function()
	{
		if (Bonfire.initing)
			return;
		Bonfire.initing=true;
		// evidentally the page needs a second to render first
		Textual.include_js("jquery.min.js");
		window.setTimeout(Bonfire.start, 25);
	},
	start: function()
	{
		body_home=$("#body_home")
		Bonfire.table=$("<tbody/>").appendTo(outer=$("<table class='bf'>"));
		body_home.append(outer);
		//remap body_home
		body_home.attr("id","container");
		Bonfire.table.attr("id","body_home");
		Bonfire.started=true;
		
		Bonfire.redrawing=true;
		Bonfire.redraw();
		Bonfire.redrawing=false;
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
	var message=$("span.message", newLine).html();
	var nick=$("span.sender", newLine).html();
	var time=$("span.time", newLine).html();
	var p=newLine.children("p"); // this is where the myself class is set
	render_time(time);
	row=$("<tr>");
	row.attr("nick", newLine.attr("nick"));
	row.attr("class", newLine.attr("class"));
	row.attr("type", newLine.attr("type"));
	// row.attr("highlight", newLine.attr("highlight"));
	if (newLine.attr("highlight")=="true")
		row.addClass("highlight")
	if (p.attr("type")=="myself")
		row.addClass("myself");
	sender=$("<td>").addClass("nick");
	if (nick && nick!=Bonfire.last_nick)
		{
			sender.html(nick);
			sender[0].oncontextmenu = function() { Textual.on_nick() }; 
			Bonfire.last_nick=nick;
		}
	msg=$("<td>").html(message).addClass("msg");
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

// Textual.on_nick=function() { app.setNick(event.target.parentNode.getAttribute('nick')); }
function on_nick() { app.setNick(event.target.parentNode.getAttribute('nick')); }