/*!
 * Button visually impaired v1.0.8
 */
(function($){
    $.bvi = function(options) {
        var default_setting = $.extend({
            'bvi_font_size': 16,
            'bvi_voice': false,
            'bvi_color': ''
        }, options);


        var versionIE = detectIE();
            
        function detectIE() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            return false;
        }

        function bvi_voice_check() {
            if(Cookies.get('bvi-voice') === 'true'){
                $('.bvi-link').show();
            } else {
                $('.bvi-link').hide();
            }
        }

        function bvi_panel_voice(text) {
            if (Cookies.get('bvi-voice') === 'true'){
                if(responsiveVoice.voiceSupport()) {
                    responsiveVoice.setDefaultVoice("Russian Female");
                    responsiveVoice.cancel();
                    responsiveVoice.speak(text);
                }
            } else {
                responsiveVoice.cancel();
            }
        }

        function bvi_voice() {
            if(responsiveVoice.voiceSupport() || versionIE >= 11 || versionIE >= 10 || versionIE >= 9) {
                responsiveVoice.setDefaultVoice("Russian Female");
                var bvi_voice = $(".bvi-voice");
                bvi_voice.each(function(index){
                    var bvi_voice_text_id = 'bvi-voice-text-id-' + index;
                    $(this).wrapInner('<div class="bvi-voice-text ' + bvi_voice_text_id + '"></div>');
                    $(this).prepend('<div class="bvi bvi-link" data-bvi-voice-class=".'+ bvi_voice_text_id +'"><div class="bvi-btn-group">' +
                        '<a href="#" class="bvi-play bvi-btn bvi-btn-outline-dark bvi-btn-sm">Воспроизвести</a>' +
                        '<a href="#" class="bvi-stop bvi-btn bvi-btn-outline-dark bvi-btn-sm">Стоп</i></a>' +
                        '</div></div>');
                });
                $('.bvi-play').click(function() {
                    var bvi_voice_class = $(this).parent().parent().data('bvi-voice-class');
                    var bvi_voice_text = $(bvi_voice_class).text();
                    if(bvi_voice_class) {
                        if(Cookies.get('bvi-voice') === 'true'){
                            responsiveVoice.speak(bvi_voice_text);
                        }
                    } else {
                        responsiveVoice.cancel();
                    }
                    return false;
                });
                $('.bvi-stop').click(function () {
                    responsiveVoice.cancel();
                    return false;
                });
            } else {
                $('.bvi-btn-voice').hide();
                set('data-bvi-voice', 'bvi-voice', false);
                console.log('Ваш браузер не поддерживает синтез речи.')
            }
        }

        function bvi_click() {
            // $("#bvi-panel-close, .bvi-panel-close").click(function() {
            //     if (Cookies.get("bvi-reload") === 'true') {
            //         document.location.reload(true);
            //     }
                
            //     Cookies.remove("bvi-font-size", {path: "/" });
            //     Cookies.remove("bvi-voice", {path: "/"});
            //     Cookies.remove("bvi-reload", {path: "/"});
            //     if(responsiveVoice.voiceSupport()) {
            //             responsiveVoice.cancel();
            //     }
            //     active();
            //     bvi_panel_voice('Обычная версия сайта');
            //     return false;
            // });

            $('.bvi-color').click(function() {
                _ = $(this);
                $('.bvi-color').removeClass('active');
                _.addClass('active')
                set('data-bvi-color', 'bvi-color', _.data('color'));
            })

            $('.js-font-size-decrease').click(function () {
                size = parseFloat(Cookies.get("bvi-font-size")) - 1;
                $(this).addClass('active').siblings().removeClass('active');
                if (size != 0) {
                    set('data-bvi-size', 'bvi-font-size', size);
                    bvi_panel_voice('Размер шрифта уменьшен');
                }
                return false;
            });

            $('.js-font-size-increase').click(function () {
                size = parseFloat(Cookies.get("bvi-font-size")) + 1;
                $(this).addClass('active').siblings().removeClass('active');
                if (size != 40) {
                    set('data-bvi-size', 'bvi-font-size', size);
                    bvi_panel_voice('Размер шрифта увеличен');
                }
                return false;
            });

            $(".js-voice").click(function () {

                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    set('data-bvi-voice', 'bvi-voice', true);
                    bvi_panel_voice('Синтез речи включён');
                } else {
                    $(this).addClass('active');
                    bvi_panel_voice('Синтез речи выключён');
                    set('data-bvi-voice', 'bvi-voice', false);
                }
                
                bvi_voice_check();
                return false;
            });

            $(document).mouseup(function (e){ // attach the mouseup event for all div and pre tags
                setTimeout(function() { // When clicking on a highlighted area, the value stays highlighted until after the mouseup event, and would therefore stil be captured by getSelection. This micro-timeout solves the issue. 
                   responsiveVoice.cancel(); // stop anything currently being spoken
                   bvi_panel_voice(getSelectionText()); //speak the text as returned by getSelectionText
                }, 1);
             });

            $(".js-settings-default").click(function() {

                // Cookies.remove("bvi-font-size", {path: "/" });
                // Cookies.remove("bvi-voice", {path: "/"});
                
                // if(responsiveVoice.voiceSupport()) {
                //         responsiveVoice.cancel();
                // }
                // active();

                $('#bvi-voice-' + Cookies.get("bvi-voice")).removeClass('active');
                $('#bvi-voice-' + default_setting.bvi_voice).addClass('active');

                Cookies.set('bvi-font-size', default_setting.bvi_font_size, {path: "/", expires: 1});
                $(".bvi-body").removeAttr('data-bvi-size');

                set('data-bvi-voice', 'bvi-voice', default_setting.bvi_voice);
                set('data-bvi-color', 'bvi-color', default_setting.bvi_color);

                if (Cookies.get('bvi-voice') === true) {
                    $('.js-voice').removeClass('active');
                } else {
                    $('.js-voice').addClass('active');
                }

                bvi_panel_voice('Настройки по умолчанию');
                return false;
            });
        }

        function set(data, set_cookies, set_cookies_data) {
            Cookies.set(set_cookies, set_cookies_data, {path: "/", expires: 1});
            $(".bvi-body").attr(data, Cookies.get(set_cookies));
        }

        function set_active_link() {
            if (Cookies.get('bvi-voice') !== 'true') {
                $('.js-voice').addClass('active');
            }
        }

        function getSelectionText() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            // for Internet Explorer 8 and below. For Blogger, you should use &amp;&amp; instead of &&.
            } else if (document.selection && document.selection.type != "Control") { 
                text = document.selection.createRange().text;
            }
            return text;
        }

        function get() {
            if (typeof Cookies.get("bvi-font-size") === 'undefined'
                || typeof Cookies.get("bvi-voice") === 'undefined'
                || typeof Cookies.get("bvi-color") === 'undefined'
            ){
                
                Cookies.set("bvi-font-size", default_setting.bvi_font_size, {path: "/", expires: 1});
                Cookies.set("bvi-voice", default_setting.bvi_voice, {path: "/", expires: 1});
                Cookies.set("bvi-color", default_setting.bvi_color, {path: "/", expires: 1});
            }

            $('.bvi-body').attr({
                'data-bvi-voice' : Cookies.get("bvi-voice"),
                'data-bvi-color' : Cookies.get("bvi-color")
            });

            if (Cookies.get("bvi-font-size") != 16) {
                $('.bvi-body').attr({
                    'data-bvi-size' : Cookies.get("bvi-font-size")
                });
            }

        }

        function active() {
            if(versionIE == 8 || versionIE == 7 || versionIE == 6 || versionIE == 5) {
                console.log('Браузер не поддерживается.');
            } else {
                panel();
                bvi_voice();
                bvi_voice_check();
                bvi_click();
                set_active_link();
            }
        }

        function panel() {
            $('body').wrapInner('<div class="bvi-body"></div>');
            get();
        }

        active();
    };
})(jQuery);