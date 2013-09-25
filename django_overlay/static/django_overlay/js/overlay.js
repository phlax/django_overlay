/*jslint browser:true */
/*global jQuery */

"use strict";

(function ($) {
    var methods, load_overlay_link, render_overlay, rscript;

    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

    render_overlay = function (node, target, close, trigger, hide) {
        var pheader, pbody, pfooter, page, page_content;

        pheader = $('.page-header', target);

        page = $('.overlay-page', target);

        page_content = $(('.page-content', page).html());

        page_content.addClass('overlay-page');

        page.replaceWith(page_content);
        page = $('.overlay-page', target);
        page_content = page.html();

        page.html('<div class="overlay-header"><button class="close" data-dismiss="overlay" type="button">x</button>'
                  + '<div class="overlay-header-content"></div></div>'
                  + '<div class="overlay-body">'
                  + page_content
                  + '</div>'
                  + '<div class="overlay-footer"></div>');

	if (trigger) {
	    page.trigger(trigger);
	}

        page.trigger('modal-load');
	
	if (hide) {
	    target.on('hidden', function () {
		page.trigger(hide);
	    })
	}
    };

    load_overlay_link = function (clicked, options) {
        var header, content, backdrop;
        if (!($(clicked).data('disabled'))) {
            $(clicked).data('disabled', true);

	    content = $('div.content', options.target);
            content.html('');
	    
	    header = $('header', options.target);
	    header.html('');

	    $('footer', options.target).html('');

	    options.target.show()

	    if (options.loading_message) {
		    content.html('<div class="message-overlay-loading padded snd-red italics biggest">' + options.loading_message + '</div>')
	    }

	    if (options.modal) {
		backdrop = $('body').find('.modal-backdrop')
		if (!(backdrop.length)) {
		    $('body').append('<div class="modal-backdrop"></div>')
		    backdrop = $('body').find('.modal-backdrop')
		}
	    }
	    
	    // add overlay header buttons
	    $('header', options.target).prepend('<div class="buttons"></div>')

	    $.get(options.url, function (result) {

		// this emulates the parsing done by $.load()
		result = $("<div>").append(result.replace(rscript, ""));

		if (options.header_buttons) {
		    for (var b in options.header_buttons) {
			var button = options.header_buttons[b];
			$('header .buttons', options.target)
			    .prepend('<a href="' + button.url + '" class="' + button.class + '">' + b + '</a>')
		    }
		}

		if (options.header) {
		    $('header', options.target).append(result.find(options.header));
		}
		if (options.footer) {
		    $('footer', options.target).prepend(result.find(options.footer));
		}
		$('a[href="#close"]', options.target).click(function (evt) {
		    evt.preventDefault();
		    options.target.hide();
		    options.target.trigger('hidden');
		    backdrop.hide();
		})
		content.html(result.find(options.content))

		if (options.onload) {
		    clicked.trigger(options.onload);
		}
		
		clicked.trigger('overlay-load');
	    })

	    
	    if (options.onhide) {
		options.target.on('hidden', function () {
		    options.target.trigger(options.onhide);
		})
	    }
	    
            options.target.on('hidden', function () {
                $(clicked).data('disabled', false);
                if (options && options.done) {
                    options.done();
                }
            });
        }
    };

    methods = {
        init: function (options) {
	    defaults = {
		'content': 'header:first h2, div[role="main"] > *',
		'header': 'header:first h1',
		'footer': 'footer:first section',
		'modal': true,
		'header_buttons': {
		    'close': {'url': '#close'},
		},
	    }
	    options = $.extend(options, defaults)
            if (this.is("a")) {
                return this.overlay('link', options);
            } else if (this.is("form")) {
                return this.overlay('form', options);
            }
        },
        link: function (options) {
            var linkopts, $this;
            $this = this;

	    if ($(this.data('target')).length) {
		target = $(this.data('target'));
	    } else {
		target = $('#overlay-page');
	    }

            linkopts = {
                target: target,
                url: this.attr('href'),
                content: this.data('overlay-content'),
                header: this.data('overlay-header'),
                footer: this.data('overlay-footer'),
                body: this.data('overlay-body'),
		close:  this.data('overlay-close'),
                modal: this.data('overlay-modal'),
		onload:  this.data('overlay-onload'),
		onhide:  this.data('overlay-onhide'),
                header_buttons: this.data('overlay-header-buttons'),
		loading_message: 'Loading...'
            };
            linkopts = $.extend({}, options, linkopts);
            return this.overlay('render', linkopts);
        },
        form: function (form, options) {

        },
        render: function (options) {
            load_overlay_link(this, options);
	    return this
        }
    };

    $.fn.overlay = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.overlay');
        }
    };

    $(document).ready(function () {
	$('a.overlay').click(function (evt) {
	    evt.preventDefault();
	    $(this).overlay();
	})
    })

}(jQuery));
