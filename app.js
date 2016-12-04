(function($) {

    var streamList = []; 
    var getStreamList = function(){
        $.getJSON('./stream-list.json',function(data){
            $.each(data.streams,function(i,v){
                showStreams('streams',createChannelDiv,v.streamName);
                streamList.push(v.streamName);
            });
        });
    };
    
    function showStreams (type,callback,streamList) {
        getData(type,streamList,callback);
    }
    
    /* single stream data */
    function getData (type,streamName,action) {
        $.ajax({
            type: 'GET',
            url: 'https://api.twitch.tv/kraken/'+type+'/'+streamName,
            dataType: 'jsonp',
            data : {
                client_id: 'eeh6runbj2931ca4gnkezqkufqe381'
            }
        }).done(function(data){
                action(data,streamName);
        }).fail(function(){
                console.log('error!');
        });
    }

    //getting el from createStreamDivs
    //checking channel status depending on the 'streams' endpoint
    var checkChannelStatus = function (data) {

        if(!data) status = 'offline';
        else status = 'online';
        return status;
    }

    //create every single divs 
    var createChannelDiv = function (data,streamName) {
        
        var $mainContainer = $('<div class="row"></div>');
        var $channel= $('<div></div>').addClass('channel col-xs-10 col-xs-offset-1 col-md-6 col-md-offset-3');
        var layout = {
            row1: $('<div class="row"></div>'),
            row2: $('<div class="row"></div>'),
            row1col1: $('<div class="col-xs-4 col-md-3 text-center"></div>'),
            row1col2: $('<div class="col-xs-8 col-md-9"></div>'),
            row2col1: $('<div class="col-xs-12"></div>')
        }
        var $logo = $('<img alt="'+ streamName +'-logo">').addClass('logo-image');
        var $url = $('<a target="_blank"></a>');
        var $title = $('<p></p>').addClass('status');
        var $details = $('<p></p>').addClass('status hidden-xs');
        var $showStreamBtn = $('<button></button>').addClass('show-player').text('Show');
        var $twitchPlayer = $('<div></div').addClass('stream-player').css({'display':'none'});
        //checking the availability of the stream, we'll use the status later to generate the content
        var status = checkChannelStatus(data.stream);
        //create divs for online channels
        if( status == 'online'){
            
            $details.html('Game: ' + data.stream.game + ' - '+ data.stream.viewers + ' <i class="fa fa-user" aria-hidden="true"></i>');
            $title.text(data.stream.channel.status);
            $logo.attr('src',data.stream.channel.logo);
            $url.attr('href',data.stream.channel.url).html($logo);           
            $twitchPlayer.attr('id',streamName);
            layout.row1col1.append($url,'<p>'+ streamName +'</p>');
            layout.row1col2.append($title,$details);
            layout.row2col1.append($showStreamBtn,$twitchPlayer);
            layout.row1.append(layout.row1col1,layout.row1col2);
            layout.row2.append(layout.row2col1);
            $channel.append(layout.row1,layout.row2);
            $mainContainer.appendTo('#online');
            
        }else{
            
            $channel.attr('data-stream',streamName);
            //create divs for offline channels
            getData('channels', streamName, function(data,streamName){
                if(data.status !== 404){
                    
                    $title.text(data.name.toUpperCase() + ' is offline!');
                    $mainContainer.appendTo('#offline');
                } else {
                    $title.text(data.message)
                    $mainContainer.appendTo('#unavailable');
                }
                if(data.logo == null) $logo.attr('src','https://goo.gl/OfV5ab');
                else $logo.attr('src',data.logo);
                layout.row1col1.append($logo,'<p>'+ streamName +'</p>');
                layout.row1col2.append($title);
                layout.row1.addClass('vertical-align').append(layout.row1col1,layout.row1col2);
                $channel.append(layout.row1);
            });
        }
        $mainContainer.attr('data-stream',streamName);
        $mainContainer.append($channel);
    };  

    var showStreamApp =function () {
        $('#online').on('click','.show-player',function(){
            console.log('works!');
            //this = .app-button
            var appDiv = $(this).next();
            console.log(appDiv);
           /* $('.show-player').not($(this)).next().hide().empty();*/
            appDiv.slideToggle('ease',function(){
                var id = $(this).attr('id');
                var options = {
                    channel: id,
                    width: '100%',
                    height: '100%'
                    //video: "{VIDEO_ID}"       
                };
                if($(this).is(':empty')){
                    var player;
                    player = new Twitch.Player(id, options);
                }
                if(appDiv.is(':hidden')) {
                    appDiv.empty();
                }

            });

        });
    };


    var clickCategories = function (spd,eas) {
        
        $('#online-channels').click(function(){
            $('#online').show();
            $('#offline, #unavailable').hide();
            $(this).addClass('selected').siblings().removeClass('selected');
            $('#online .stream-player').empty().hide();
        });

        $('#all-channels').click(function(){
            $('#offline, #unavailable, #online').show();
            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');
            $('#online  .streamplayer').empty().hide();
        });

        $('#offline-channels').click(function(){
            $('#offline, #unavailable').show();
            $('#online').hide();
            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');
            $('#online .stream-player').empty().hide();
        });

    }
    
    $('.search-box').on('keyup',function(e){
       var inputVal = $(this).val().toLowerCase();
       var channels = $('.channel');
       var singleCh;
       var dataVal;
        //$.each for jquery collection
       for(var i=0; i<channels.length;i++){
            singleCh = channels[i];
            dataVal = singleCh.parentNode.getAttribute('data-stream');
           if(dataVal.toLowerCase().indexOf(inputVal) > -1) {
               singleCh.parentNode.style.display = '';
           } else {
               singleCh.parentNode.style.display = 'none';
           }
       }
        
    });
    
    function returnBackToTop(){
        var offset = 250;
        var duration = 500;
        $(window).scroll(function(){
           if($(this).scrollTop() > offset){
               $('.back-to-top').fadeIn(duration);
           } else {
               $('.back-to-top').fadeOut(duration);
           }
        });
        $('.back-to-top').click(function(e){
            e.preventDefault();
            $('html,body').animate({scrollTop:0},duration);
            return false;
        });
    }
    
    getStreamList();
    clickCategories(800);
    showStreamApp();
    returnBackToTop();
})(jQuery);



