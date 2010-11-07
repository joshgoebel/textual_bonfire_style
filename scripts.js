function IncludeJavaScript(jsFile)
{
  document.write('<script type="text/javascript" src="'
    + jsFile + '"></scr' + 'ipt>'); 
}
IncludeJavaScript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js");

function rewrite_all()
{
	$("#body_home .line").each (function(i) {
		num=this.id.replace("oldline","");
		num=parseInt(num);
		newMessagePostedToDisplay(num,"old");
	});
}

var chatlog={};
var table=$("<table class='bf'>");
window.setTimeout( function(){$("#body_home").append(table);}, 100)
window.setTimeout(rewrite_all, 500);

function newMessagePostedToDisplay(lineNumber, prefix)
{
	prefix=prefix || "";
	look_for="#" + prefix + "line" + lineNumber;
	var newLine = $(look_for);
	var message=$(look_for + " span.message").html();
	var nick=$(look_for + " span.sender").html();
	var p=$(look_for + " p");
	// add_message(newLine);
	row=$("<tr>");
	row.addClass(newLine.className);
	row.attr("type", newLine.attr("type"));
	row.attr("highlight", newLine.attr("highlight"));
	if (p && p.attr("type")=="myself")
		row.addClass("myself");
	sender=$("<td>").addClass("nick");
	if (nick && nick!=chatlog.last_nick)
		{
			sender.html(nick);
			chatlog.last_nick=nick;
		}
	msg=$("<td>").html(message).addClass("msg");
	row.append(sender).append(msg);
	table.append(row);
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