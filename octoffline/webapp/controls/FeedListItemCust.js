$.sap.declare("glb.gtmh.oct.controls.FeedListItemCust");

sap.m.FeedListItem.extend("glb.gtmh.oct.controls.FeedListItemCust",{ // call the new Control type "HighlightField"
    // and let it inherit from sap.ui.commons.TextField


    renderer: {
      urlifyMe :function(text) {
          var urlRegex = /(https?:\/\/[^\s]+)/g;
          return text.replace(urlRegex, function(url) {
              return '<a target="_blank" style="font-weight:normal" href="' + url + '">' + url + '</a>';
            //url = url.link(url);
            // return url;
          });
      },

      getFeedListItemIconComponent:function(oFeedListItem){
        var m,
          rex = /<octicon>(.*?)<\/octicon>/g;
          var str = oFeedListItem.getText();
        var iconDetails=null;
        var compDetails={};
        while ( ( m = rex.exec( str ) ) != null ) {
          iconDetails= m[1].split("|");
        }
        str=str.replace(rex,'');

        rex =  /<octtext>(.*?)<\/octtext>/g;
        var textDetails=null;
        var icon=null;
        while ( ( m = rex.exec( str ) ) != null ) {
          textDetails= m[1].split("|");
        }
        str=str.replace(rex,'');
        if(iconDetails!==null){
          var iconDtl={
              name:iconDetails[0].split("=")[1],
              color:iconDetails[1].split("=")[1]
          };
        var vLayout = new sap.ui.layout.VerticalLayout({
             content:[
                  ]
                  });

        icon=new sap.ui.layout.HorizontalLayout({
        content:[
//                  new sap.ui.commons.HorizontalDivider({
//                    width:'0.2rem',
//                    height:'Large'
//                  }).addStyleClass("divider"),
              new sap.ui.core.Icon({
                src:'sap-icon://'+iconDtl.name,
                color:iconDtl.color
                 }).addStyleClass("icon"),
                 vLayout
               ]
          }).addStyleClass("parentLayout");
      for(var i=0;i<textDetails.length;i++){
        var label=new sap.m.Label({
          text:textDetails[i]
        });
        vLayout.addContent(label);

      }
        }
       compDetails.icon=icon;
       compDetails.iconDetails = iconDetails;
       compDetails.text = str;
       return compDetails;
      },
        // note that NO render() function is given here! The TextField's render() function is used.
        // But one function is overwritten:

      renderLIContent : function(rm, oFeedListItem) {
        // convenience variable
        var sMyId = oFeedListItem.getId(), bIsPhone = sap.ui.Device.system.phone;
        rm.write('<div');
        rm.writeControlData(oFeedListItem);
        rm.addClass('sapMFeedListItem');

        rm.writeClasses();
        rm.write('>');

        // icon
        if (!!oFeedListItem.getShowIcon()) {
          this._writeImageControl(rm, oFeedListItem, sMyId);
        }

        //for custom icon in text
        var oFeedListIconComp = this.getFeedListItemIconComponent(oFeedListItem);
        //End

        // text (starting with sender)

        if (bIsPhone) {
          rm.write('<div class= "sapMFeedListItemHeader ');
          if (!!oFeedListItem.getShowIcon()) {
            rm.write('sapMFeedListItemHasFigure ');
          }
          if (!!oFeedListItem.getSender() && !!oFeedListItem.getTimestamp()) {
            rm.write('sapMFeedListItemFullHeight');
          }
          rm.write('" >');
          if (!!oFeedListItem.getSender()) {
            rm.write('<p id="' + sMyId + '-name" class="sapMFeedListItemTextName">');
            rm.renderControl(oFeedListItem._getLinkSender(false));
            rm.write('</p>');
          }
          if (!!oFeedListItem.getTimestamp()) {
            // write date
            rm.write('<p class="sapMFeedListItemTimestamp">');
            rm.writeEscaped(oFeedListItem.getTimestamp());
            rm.write('</p>');
          }

          rm.write('</div>');
          rm.write('<p class="sapMFeedListItemText">');
          rm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemText">');
          if (!!oFeedListItem._checkTextIsExpandable()) {
            this._writeCollapsedText(rm, oFeedListItem, sMyId);
          } else {
            rm.write(this.urlifyMe(oFeedListIconComp.text));
            rm.write('</span>');
          }
          rm.write('</p>');
          if(oFeedListIconComp.iconDetails!==null){
          rm.renderControl(oFeedListIconComp.icon);
          }
          if (!!oFeedListItem.getInfo()) {
            // info
            rm.write('<p class="sapMFeedListItemFooter">');
            if (!!oFeedListItem.getInfo()) {
              rm.write('<span id="' + sMyId + '-info" class="sapMFeedListItemInfo">');
              rm.writeEscaped(oFeedListItem.getInfo());
              rm.write('</span>');
            }
            rm.write('</p>');
          }
        } else {
          rm.write('<div class= "sapMFeedListItemText ');
          if (!!oFeedListItem.getShowIcon()) {
            rm.write('sapMFeedListItemHasFigure ');
          }
          rm.write('" >');

          rm.write('<p id="' + sMyId + '-text" class="sapMFeedListItemTextText" >');
          if (!!oFeedListItem.getSender()) {
            rm.write('<span id="' + sMyId + '-name" class="sapMFeedListItemTextName linkAsText">');
            rm.renderControl(oFeedListItem._getLinkSender(true));
            rm.write(' ');
            rm.write('</span>');
          }
          rm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemTextString">');
          if (!!oFeedListItem._checkTextIsExpandable()) {
            this._writeCollapsedText(rm, oFeedListItem, sMyId);
          } else {
            rm.write(this.urlifyMe(oFeedListIconComp.text));
            rm.write('</span>');
          }
          rm.write('</p>');
          if(oFeedListIconComp.iconDetails!==null){
              rm.renderControl(oFeedListIconComp.icon);
              }
          if (!!oFeedListItem.getInfo() || !!oFeedListItem.getTimestamp()) {
            // info and date
            rm.write('<p class="sapMFeedListItemFooter">');
            if (!sap.ui.getCore().getConfiguration().getRTL()) {
              if (!!oFeedListItem.getInfo()) {
                this._writeInfo(rm, oFeedListItem, sMyId);
                // Write Interpunct separator if necessary (with spaces before and after)
                if (!!oFeedListItem.getTimestamp()) {
                  rm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
                }
              }
              if (!!oFeedListItem.getTimestamp()) {
                this._writeTimestamp(rm, oFeedListItem, sMyId);
              }
            } else {
              if (!!oFeedListItem.getTimestamp()) {
                this._writeTimestamp(rm, oFeedListItem, sMyId);
              }
              if (!!oFeedListItem.getInfo()) {
                // Write Interpunct separator if necessary (with spaces before and after)
                if (!!oFeedListItem.getTimestamp()) {
                  rm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
                }
                this._writeInfo(rm, oFeedListItem, sMyId);
              }

            }
            rm.write('</p>');
          }
          rm.write('</div>');
        }
        rm.write('</div>');

        }
    }
});