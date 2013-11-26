// Ensure app namespace
var Components = Components || {};

(function ($) {

Components.Main = {

    init: function () {
		Components.Slider.init();
	}
};


Components.Slider = {
    
    vars:{
        active:0,
        total:0,
        slideWidth:0,
        slideHeight:0,
        speed: 300, 
        isAnimating: false
    }, 
	
	elements: {
		$slider: {}, 
		$slidesContainer: {},
		$slides: {},
		$nextButton: {}, 
		$prevButton: {},
		$sliderNav: {}		
	}, 

    init: function() {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;        
        
        o.initElements(); 
        o.showSlide(v.active); 
        o.updateNav(v.active);
        
        v.total = el.$slides.length; 
                
        el.$nextButton.on("click", function(e){ 
            e.preventDefault(); 
            o.next(); 
        }); 
        
        el.$prevButton.on("click", function(e){ 
            e.preventDefault(); 
            o.prev(); 
        }); 
        
        el.$sliderNav.on("click", "a", function(e){ 
            e.preventDefault();
            var $trigger = $(e.target);
            var index = $trigger.parent().index(); 
            o.updateNav(index); 
            o.gotoSlide(index);  
        }); 
    }, 
	
	
	initElements: function(){
        var o = Components.Slider,  
            el = o.elements;
				
		el.$slider = $("#slider"); 
		el.$slidesContainer = el.$slider.find(".slide-container"); 
		el.$slides = el.$slidesContainer.find(".slide"); 
		el.$nextButton = el.$slider.find(".next-button"); 
		el.$prevButton = el.$slider.find(".prev-button");
		el.$sliderNav = $("#slider-nav ul"); 		
	
	},
	
	showSlide: function(index) {
        var o = Components.Slider,  
            el = o.elements;      

		el.$slides.eq(index).show(); 
	}, 
	
	hideSlide: function(index) {
        var o = Components.Slider,  
            el = o.elements;
                  
		el.$slides.eq(index).hide();
	}, 

	showSlides: function(steps, direction) {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;     
        
        steps = steps || 1; 
        direction = direction || 1;
        
        for (var i = 0; i < steps; i++) {
	    	var next = v.active + (direction * (i + 1)); 
	    	o.showSlide(next);    
        }
	}, 
	
	hideSlides: function() {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;     
		
		// hides everything except active slide  
        for (var i = 0; i < v.total; i++) {
			if (i != v.active) {
				o.hideSlide(i);
			}    
        }
	}, 

	updateNav: function(active) {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;        
		
		if (typeof active === "undefined") {
			active = v.active; 
		}
		
		var $activeMenu = el.$sliderNav.find(".active"); 
		if ($activeMenu.index() == active) {return;}
		
		$activeMenu.removeClass("active"); 
		el.$sliderNav.children().eq(active).addClass("active");
	}, 

	
    next: function() {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;        
        		
        var next = v.active + 1; 
        o.gotoSlide(next); 
	}, 

    prev: function() {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;        
        
        var prev = v.active - 1; 
        
		o.gotoSlide(prev);	
	},

    gotoSlide: function(index) {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;        
        
        if (index == v.active || v.isAnimating) { return; }
		
		v.isAnimating = true;         
		
		var direction = (index > v.active) ? 1 : -1;
		var steps = Math.abs(index - v.active);  
        var startPos = 0; 
        var endPos = 0; 
		
		o.staticStyles(steps);
        
        if (direction > 0) {
	        endPos = -(v.slideWidth * steps);
        } else {
	        startPos = -(v.slideWidth * steps);
        }

		if (index >= v.total) { 
			// need to clone first slide then remove.
			el.$slidesContainer.append(el.$slides.eq(0).clone());
			el.$slides = el.$slidesContainer.find(".slide");
		} else if (index < 0) {
			el.$slidesContainer.prepend(el.$slides.eq(v.total - 1).clone());
			el.$slides = el.$slidesContainer.find(".slide");
			o.showSlide(0);
		}
               
        o.showSlides(steps, direction); 
                
        
        o.animateSlides(index, startPos, endPos);
    },

	animateSlides: function(next, startPos, endPos) {
		var o = Components.Slider,  
            v = o.vars,
            el = o.elements;     	
		
		el.$slidesContainer.css({left:startPos});
        el.$slidesContainer.animate({left:endPos}, v.speed, "easeOutCubic", function(){
            
            // clean up cloned slides 
            if (next >= v.total) {
				el.$slides.eq(next).remove();
				el.$slides = el.$slidesContainer.find(".slide");
				next = 0;
				o.showSlide(next);  
            } else if (next < 0) {
				el.$slides.eq(0).remove();
				el.$slides = el.$slidesContainer.find(".slide");
				next = v.total - 1;
				o.showSlide(next);  	            
            }
            
            v.active = next;
            o.updateNav();
            o.hideSlides(); 
            o.removeStaticStyles();
            el.$slidesContainer.css({left:""});
			v.isAnimating = false;
        }); 
	},
	    
    staticStyles: function(steps) {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;      
        
        v.slideWidth  = el.$slidesContainer.children(':eq('+ v.active +')').width(); 
        v.slideHeight = el.$slidesContainer.children(':eq('+ v.active +')').height(); 
        
        for (var i=0; i < el.$slides.length; i++){
            $(el.$slides[i]).css({width:v.slideWidth, height:v.slideHeight});
        }
        
        var numSlides = steps + 1; 
        
        el.$slidesContainer.css({width:(v.slideWidth * numSlides), height:v.slideHeight, position:"absolute"});           
        el.$slider.css({height:v.slideHeight});
    }, 

    removeStaticStyles: function() {
        var o = Components.Slider,  
            v = o.vars,
            el = o.elements;      
        
        for (var i =0; i < el.$slides.length; i++){
            $(el.$slides[i]).css({width:"", height:""});
        }
        
        el.$slidesContainer.css({width:"", height:"", position:""});           
        el.$slider.css({height:""});
    }

};

$(Components.Main.init);

})(jQuery);
