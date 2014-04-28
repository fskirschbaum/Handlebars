$( function() {

	var $welcomeHeader = $( '#welcomeHeader' ),
			$welcomeMessage = $( '#welcomeMessage' ),
			$mainBtn = $( '#mainBtn' ),
			$toggleBtn = $( '#toggleBtn'),
			$clearBtn = $( '#clearBtn' ),
      $widgetContainer = $( '#widgetContainer' ),
      $examples = $( '#examples' );

  function processData( content, templates, positions ) {
    var template = '',
        templateArray = [],
        contentArray = [],
        result = {},
        currentRow = 0,
        lastRow = 0,
        data = {},
        widget,
        property,
        prop;

        console.log( content, templates, positions );

    for ( widget in content ) {
      console.log( widget );
      data[widget] = positions[widget];
      data[widget].template = templates[widget].template;
      data[widget].content = content[widget];
    }

    console.log( data );

    for ( widget in data ) {
      for ( property in data[widget] ) {
        switch ( property ) {
          case 'row' :
            lastRow = currentRow;
            if ( currentRow < data[widget][property] ) {
              if ( lastRow !== 0 ) {
                template += '</div>\n';
                templateArray.push('</div>\n');
              }
              currentRow = data[widget][property];
              template += '<div class="row">\n';
              templateArray.push( '<div class="row">\n' );
            }
            break;
          case 'pos' :
            // We're not doing anything with this... yet?
            break;
          case 'col' :
            template += '<div class="col-md-' + data[widget][property] + '">\n';
            templateArray.push( '<div class="col-md-' + data[widget][property] + '">\n' );
            break;
          case 'template' :
            template += data[widget][property];
            templateArray.push( data[widget][property] );
            break;
          case 'content' :
            contentArray.push( data[widget][property] );
            break;
          default :
            break;
      }
      template += '</div>\n';
      templateArray.push( '</div>\n' );
    }
    template += '</div>\n';
    templateArray.push( '</div>\n' );
    console.log( templateArray );
    result.template = template;
    result.content = {};
    contentArray.forEach( function( el, idx, arr ) {
          for ( prop in el ) {
            result.content[prop] = el[prop];
          }
        });
      }
    console.log( result );
    return result;
  }

	$( document ).ready( function() {

    if ( window.localStorage.templates ) {
      console.log( window.localStorage.templates );
    } else {
      $.ajax({
        type: 'GET',
        url: '/templates',
        success: function( data, status, request ) {
          console.log( 'Ajax Success: ' + status );
          window.localStorage.setItem( 'templates', JSON.stringify( data ) );
        },
        error: function( request, status ) {
          console.log( 'Ajax error: ' + status);
        }

      }, 'json');
    }

    if ( window.localStorage.positions ) {
      console.log( window.localStorage.positions );
    } else {
      $.ajax({
        type: 'GET',
        url: '/positions',
        success: function( data, status, request ) {
          console.log( 'Ajax Success: ' + status );
          window.localStorage.setItem( 'positions', JSON.stringify(data) );
        },
        error: function( request, status ) {
          console.log( 'Ajax error: ' + status);
        }
      }, 'json');
    }

		if ( window.localStorage.content  && window.localStorage.templates && window.localStorage.positions ) {
			var oldContent = JSON.parse( window.localStorage.content ),
          oldTemplates = JSON.parse( window.localStorage.templates ),
          oldPositions = JSON.parse( window.localStorage.positions ),
          oldData = processData( oldContent, oldTemplates, oldPositions ),
          template = Handlebars.compile( oldData.template ),
          html = template( oldData.content );

			$welcomeHeader.html( 'Welcome Back!' );
			$welcomeMessage.html( 'Since you\'ve been here before, we\'ve processed your stored data and re-displayed it. You can use the Ready button to get new data, and if you refresh the page you should see it persist. You can hit the Toggle Examples Button to toggle between the syntax container that was removed and the content that was rendered. You can also hit the Clear Local Storage button to reset the Local Storage and refresh the page back to the original state.' );
			$toggleBtn.show();
			$clearBtn.show();
			$mainBtn.html( 'Again?' );
      $widgetContainer.fadeIn( function() {
        $widgetContainer.html( html );
        $examples.hide();
      });
		}
	});

  $mainBtn.click( function() {
    $.ajax( {
      type: 'GET',
      url: '/content',
      success: function( data, status, request ) {
        console.log( 'ajax success:', data );

        var templates = JSON.parse( window.localStorage.templates),
            positions = JSON.parse( window.localStorage.positions ),
            processedData = processData( data, templates, positions ),
        		template = Handlebars.compile( processedData.template ),
            html = template( processedData.content );

        window.localStorage.setItem( 'content', JSON.stringify( data ) );

        $mainBtn.fadeOut( function() {
          $mainBtn.removeClass( 'btn-primary' ).addClass( 'btn-success' ).html( 'Success!' ).fadeIn( function() {
          	$toggleBtn.fadeIn();
            setTimeout( function(){
              $mainBtn.removeClass( 'btn-success' ).addClass( 'btn-primary' ).html( 'Again?' );
            }, 2000 );
          });
        });
        $widgetContainer.fadeIn( function() {
          $widgetContainer.html( html );
          $examples.hide();
        });
        $welcomeHeader.html( 'Success!!' );
        $welcomeMessage.html( 'There\'s a new button now, Toggle Examples, which will allow you to do exactly that that. Which is pretty cool if you want to see what was rendered. Also, if you refresh the page, you should see the content here be re-displayed automagically. It\'s not voodoo, probably. To get new data, just hit the Again? button. Be aware that this only refreshes the \'Article Widget\' today.' );
      },
      error: function( request, status ) {
        console.log( 'ajax error:', status );
        var template = Handlebars.compile( '<div class="row">\n<div class="col-md-12">\n<h1>{{errorHeading}}</h1>\n<p class="bg-danger">{{errorText}}</p><\n/div>\n</div>\n' );
        var data = { "errorHeading" : "Ajax Error", "errorText" : "The Ajax request failed, the server respoonse was: " + status };
        var result = template( data );
        $( "#widgetContainer" ).html( result );
        $( "#mainBtn" ).fadeOut( function() {
          $( '#mainBtn' ).removeClass( 'btn-primary' ).addClass( 'btn-danger' ).html( 'Error!' ).fadeIn();
        });
      }
    }, 'json');
	});

	$toggleBtn.click( function() {
	  $examples.toggle();
    $widgetContainer.toggle();
	});

	$clearBtn.click( function() {
		window.localStorage.clear();
		window.location.reload();
	});
});