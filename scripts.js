// setTimeout(function() { Bonfire.init(); },10)
// $(window).load(function() { Bonfire.init(); })

var Bonfire={
	init: function()
	{
		if (Bonfire.initing) { return }
		Bonfire.initing = true;
    // Textual.include_js("jquery.tiny.js");
    // Textual.include_js("zepto.tiny.js");
    Textual.include_js("zepto8.tiny.js");
    Textual.include_js("support.js");
    // evidentally the page needs a second to render, parse JS, etc
		setTimeout(Bonfire.start, 25);
	},
	start: function()
	{
    // console.log("start");
	  Bonfire.fixup_zepto();
		Bonfire.render = new Renderer($("#thelog"), $("#body_home"));
		Bonfire.started = true;
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
};

Textual.newMessagePostedToView=function(lineNumber)
{
  // FinishedLoding or FinishedReload event should spooling us up, patience
	if (!Bonfire.started)
		return;
	
  // window.console.log("new message posted:",lineNumber,
  //     "backlog:", backlog);

  Bonfire.render.message(lineNumber);
  return;
}

// replace Textual mark with our own
Textual.historyIndicatorAddedToView = function()
{
  console.log("historyIndicatorAddedToView");
  if (Bonfire.render)
    Bonfire.render.set_mark();
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