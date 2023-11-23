var mapMgr = {
	fPathMapImages : "ide:content/des:div.map_highlight_on/chi:img.map_empty",
	init : function(){
		scOnLoads[scOnLoads.length] = this;
	},
	onLoad : function(){
		try{
			scCoLib.util.log("mapMgr.onLoad");
			this.fMapImages = scPaLib.findNodes(this.fPathMapImages);
			for (var i=0; i<this.fMapImages.length; i++){
				scMapMgr.maphighlight(this.fMapImages[i]);
			}
		} catch (e){
			scCoLib.util.log("mapMgr.onLoad ERROR : "+e);
		}
		
	},
	onLoadSortKey : "Z"
}

