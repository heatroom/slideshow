var $ = require('jquery');

function Skippr(element, options) {
	if (!this instanceof Skippr) return new Skippr(element, options);
	this.settings = $.extend(this.defaults, options);
	this.$element = $(element);
	this.$parent = $element.parent();
	this.$photos = $element.children();
	this.count = $photos.length;
	this.countString = String(this.count);
	this.init();
}

module.exports = Skippr;


Skippr.prototype.init = function() {
	var me = this;
	this.setup();
	this.navClick();
	this.arrowClick();
	this.resize();
	this.keyPress();
	if (this.settings.autoPlay == true) {
		this.autoPlay();
		this.autoPlayPause();
	}
};

Skippr.prototype.setup = function() {
	var me = this;
	if (this.settings.childrenElementType == 'img') {
		var makeDivs = [];
		for (var i = 0; i < this.count; i++) {
			var src = this.$photos.eq(i).attr(src),
			    insert = '<div style="background-image: url(' + src + ')"></div>';
			makeDivs.push(insert);
		}
		makeDivs.join("");
		this.$element.append(makeDivs);
		this.$element.find('img').remove();
		this.$photos = this.$element.children();
	}

	if (this.settings.transition == 'fade') {
		this.$photos.not(":first-child").hide();
	}

	if (this.settings.transition == 'slide') {
		this.setupSlider();
	}

	this.$photos.eq(0).addClass('visible');
	this.$element.addClass('skippr');

	this.navBuild();
};

Skippr.prototype.resize = function() {
	if (this.settings.transition == 'slide') {
		$(window).resize(function() {
			var currentItem = $(".skippr-nav-element-active").attr('data-slider');
		});

		this.setupSlider();

		this.$photos.each(function() {
			var amountLeft = parseFloat($(this).css('left'));
			    parentWidth = this.$parent.width(),
			    moveAmount;
			if (currentItem > 1) {
				moveAmount = amountLeft - (parentWidth * (currentItem - 1));
			}
			$(this).css('left', moveAmount + 'px');
		});
	}
};

Skippr.prototype.arrowBuild = function() {
	var me = this
		previous
		next
		startingPrevious = this.count
		previousStyle = '';

	if (this.settings.hidePrevious == true) {
		previousStyle = 'style="display:none;"';
	}

	previous = '<nav class="skippr-nav-item skippr-arrow skippr-previous" data-slider=">' + 
				startingPrevious + '" ' + previousStyle + '></nav>';
	next = '<nav class="skippr-nav-item skippr-arrow skippr-next" data-slider="2"></nav>';
	this.$element.append(previous + next);
};

Skippr.prototype.navBuild = function() {
	var me = this
		container
		navElements = [];

	if (this.settings.navType == "block") {
		var styleClass = "skippr-nav-element-block";
	} else if (this.settings.navType == "bubble") {
		var styleClass = "skippr-nav-elment-bubble";
	}

	for (var i = 0; i < this.count; i++) {
		//cycle through slideshow divs and display correct number of bubbles
		var insert;
		if (i == 0) {
			//check if first bubble, and respective active class
			insert = "<div class='skippr-nav-element skippr-nav-item " + styleClass + 
					" skippr-nav-element-active' data-slider='" + (i+1) + "'></div>";
		} else {
			insert = "<div class='skippr-nav-element skippr-nav-item " + styleClass + 
					"' data-slider='" + (i+1) + "'></div>";
		}
		//insert bubbles into an array
		navElements.push(insert);
	}
	//join array elements into a single string
	navElements = navElements.join("");
	//append html to bubbles container div.
	container = '<nav class="skippr-nav-container">' + navElements + '</nav>'
	this.$element.append(container);
};

Skippr.prototype.arrowClick = function() {
	var me = this;
	$(".skippr-arrow").click(function() {
		if (!$(this).hasClass('disabled')) {
			this.change($(this));
		}
	});
};

Skippr.prototype.navClick = function() {
	var me = this;
	this.$element.find('.skippr-nav-element').click(function() {
		if (!$(this).hasClass('disabled')) {
			this.change($(this));
		}
	});
};

Skippr.prototype.change = function(element) {
	var me = this,
		item = element.attr('data-slider'),
		allNavItems = $('.skippr-nav-item'),
		currentItem = $('.skippr-nav-element-active').attr('data-slider'),
		nextData = $('.skippr-next').attr('data-slider'),
		previousData = $('.skippr-previous').attr('data-slider');

	if(item != currentItem){//prevents animation for repeat click.
		if (this.settings.transition == 'fade') {
			this.$photos.eq(item - 1).css('z-index', '10').siblings('div').css('z-index', '9');
			this.$photos.eq(item - 1).fadeIn(this.settings.speed, function() {
				$('.visible').fadeOut('fast', function() {
					$(this).removeClass('visible');
					$photos.eq(item - 1).addClass('visible');
				});
			});
		}

		if (this.settings.transition == 'slide') {
			this.$photos.each(function() {
				var amountLeft = parseFloat($(this).css('left')),
				    parentWidth = this.$parent.width(),
				    moveAmount;

				if (item > currentItem) {
					moveAmount = amountLeft - (parentWidth * (item - currentItem));
				}

				if (item < currentItem) {
					moveAmount = amountLeft + (parentWidth * (currentItem - item));
				}
				allNavItems.addClass('disabled');

				// $(this).velocity({'left': moveAmount + 'px'}, this.settings.speed, this.settings.easing, function () {
				// 	allNavItems.removeClass('disabled');
				// });
			    allNavItems.removeClass('disabled');
			});
		}

		$('.skippr-nav-element').eq(item - 1).addClass('skippr-nav-element-active').siblings().removeClass('skippr-nav-element-active');

	    var nextDataAddString = Number(item) + 1,
	        previousDataAddString = Number(item) - 1;

	    if (item == this.count) {
	    	$(".skippr-next").attr('data-slider', '1');
	    } else {
	    	$(".skippr-next").attr('data-slider', nextDataAddString);
	    }

	    if (item == 1) {
	    	$('.skippr-previous').attr('data-slider', this.countString);
	    } else {
	    	$('.skippr-previous').attr('data-slider', previousDataAddString);
	    }

	    if (this.settings.hidePrevious == true) {
	    	this.hidePrevious();
	    }
	}
};

Skippr.prototype.autoPlay = function() {
	var me = this;
	timer = setInterval(function() {
		var activeElement = $(".skippr-nav-element-active"),
		    activeSlide = activeElement.attr('data-slider');

		if (activeSlide == this.count) {
			var elementToInsert = $(".skippr-nav-element").eq(0);
		} else {
			var elementToInsert = activeElement.next();
		}
		this.change(elementToInsert);
	}, this.settings.autoPlayDuration);
};

Skippr.prototype.autoPlayPause = function() {
	var me = this;
	this.$parent.hover(function() {
		clearInterval(timer);	
	}, function() {
		me.autoPlay();
	});
};

Skippr.prototype.setupSlider = function() {
	var me = this,
	    parentWidth = this.$parent.width(),
	    amountLeft;

	this.$photos.css('position', 'absolute');

	for(var i = 0; i < this.count; i++) {
		amountLeft = parentWidth * i;
		this.$photos.eq(i).css('left', amountLeft);
	}
};

Skippr.prototype.keyPress = function() {
	var me = this;
	if (this.settings.keyboardOnAlways == true) {
		$(document).on('keydown', function(e) {
			if (e.which == 39) {
				$('.skippr-next').trigger('click');
			}
			if (e.which == 37) {
				$('.skippr-previous').trigger('click');
			}
		});
	}
	if (this.settings.keyboardOnAlways == false) {
		this.$parent.hover(function() {
			$(document).on('keydown', function(e) {
				if (e.which == 39) {
					$('.skippr-next').trigger('click');
				}
				if (e.which == 37) {
					$('.skippr-previous').trigger('click');
				}
			})
		}, function() {
			$(document).off('keydown');
		});
	}
};

Skippr.prototype.hidePrevious = function() {
	var me = this;
	if ($(".skippr-nav-element").eq(0).hasClass('skippr-nav-element-active') {
		$(".skippr-previous").fadeOut();
	} else {
		$(".skippr-previous").fadeIn();
	}
};

Skippr.prototype.defaults = {
	transition: 'slide',
	speed: 1000,
	easing: 'easeOutQuart',
	navType: 'block',
	childrenElementType: 'div',
	arrows: true,
	autoPlay: true,
	autoPlayDuration: 5000,
	keyboardOnAlways: true,
	hidePrevious: false
};




































