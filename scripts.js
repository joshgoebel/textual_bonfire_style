/*

Copyright © 2010, 2011, 2012 Josh Goebel

*/ 

// setTimeout(function() { Bonfire.init(); },10)
// $(window).load(function() { Bonfire.init(); })

var Bonfire={
	init: function()
	{
		if (Bonfire.initing) { return }
		Bonfire.initing = true;
    // Textual.include_js("jquery.tiny.js");
    // Textual.include_js("zepto8.tiny.js");
    // Textual.include_js("support.js");
    // evidentally the page needs a second to render, parse JS, etc
		setTimeout(Bonfire.start, 25);
	},
	start: function()
	{
		Bonfire.render = new Renderer($("#body_home"));
		Bonfire.started = true;
	},
};

Textual.newMessagePostedToView=function(lineNumber)
{
  // FinishedLoding or FinishedReload event should spooling us up, patience
	if (!Bonfire.started)
		return;
	
  Bonfire.render.message(lineNumber);
  return;
}

// replace Textual mark with our own
Textual.historyIndicatorAddedToView = function() {}

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