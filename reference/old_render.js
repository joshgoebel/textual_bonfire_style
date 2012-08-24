Textual.xx_newMessagePostedToDisplay=function(lineNumber)
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

// Textual.on_nick=function() { app.setNick(event.target.parentNode.getAttribute('nick')); }
Textual.on_nick = function() { app.setNick(event.target.parentNode.getAttribute('nick')); }