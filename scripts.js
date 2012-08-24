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
    Textual.include_js("support.js");
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
		Bonfire.started=true;
		Bonfire.render = new Renderer($("#thelog"), $("#body_home"));
	},
};

Textual.newMessagePostedToView=function(lineNumber,backlog)
{
  // FinishedLoding or FinishedReload event should spooling us up, patience
	if (!Bonfire.started)
		return;
	
  // window.console.log("new message posted:",lineNumber,
  //     "backlog:", backlog);

  // wait until we are finishg redrawing to start normal logging
	if (Bonfire.redrawing && !backlog)
	  return;
  
  Bonfire.render.message(lineNumber);
  return;
}

// replace Textual mark with our own
Textual.historyIndicatorAddedToView = function()
{
  console.log("historyIndicatorAddedToView");
  if (Bonfire.render)
    Bonfire.render.move_mark();
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