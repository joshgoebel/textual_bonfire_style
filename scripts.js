function IncludeJavaScript(jsFile)
{
  document.write('<script type="text/javascript" src="'
    + jsFile + '"></scr' + 'ipt>'); 
}
// IncludeJavaScript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js");
IncludeJavaScript("jquery.min.js");

var Bonfire={
	init: function()
	{
		// evidentally the page needs a second to render first
		window.setTimeout(Bonfire.start, 50)
	},
	start: function()
	{
		Bonfire.table=$("<table class='bf'>");
		$("#body_home").append(Bonfire.table);
		Bonfire.redrawing=true;
		Bonfire.redraw();
		Bonfire.redrawing=false;
	},
	redraw: function()
	{
		$("#body_home div.line").each (function(i) {
			num=this.id.replace("oldline","");
			num=parseInt(num);
			newMessagePostedToDisplay(num,"old");
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

$(window).load(function() { Bonfire.init(); })

function newMessagePostedToDisplay(lineNumber, prefix)
{
	// move the mark
	if (!Bonfire.redrawing)
		Bonfire.move_mark();
	
	prefix=prefix || "";
	look_for="#" + prefix + "line" + lineNumber;
	var newLine = $(look_for);
	var message=$("span.message", newLine).html();
	var nick=$("span.sender", newLine).html();
	// var p=$(look_for + " p");
	var p=newLine.children("p");
	// add_message(newLine);
	row=$("<tr>");
	row.addClass(newLine.className);
	row.attr("type", newLine.attr("type"));
	row.attr("highlight", newLine.attr("highlight"));
	if (p.attr("type")=="myself")
		row.addClass("myself");
	sender=$("<td>").addClass("nick");
	if (nick && nick!=Bonfire.last_nick)
		{
			sender.html(nick);
			Bonfire.last_nick=nick;
		}
	msg=$("<td>").html(message).addClass("msg");
	row.append(sender).append(msg);
	Bonfire.table.append(row);
	// rework ids
	id=newLine.attr("id");
	if (prefix=="") {
		newLine.attr("id","old" + id); }
	row.attr("id",id);
	newLine.hide();
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

/* The following function calls are required. Add additonal code above it. */
function on_url() { app.setUrl(event.target.innerHTML); }
function on_addr() { app.setAddr(event.target.innerHTML); }
function on_chname() { app.setChan(event.target.innerHTML); }
function on_nick() { app.setNick(event.target.parentNode.parentNode.getAttribute('nick')); }