if (typeof exports === 'object' && typeof exports.nodeName !== 'string' && typeof define !== 'function') {
    var define = function (factory) {
        factory(require, exports, module);
    };
}

define(function (require, exports, module) {
	var makeCellIndex = function(x,y,width) {
		return [Math.floor(x/width),Math.floor(y/width)];
	};

	var makeKey = function(ix,iy,ip) {
		return ix+'$'+iy+'$'+ip;
	};

	var boxSize = function(box) {
		return Math.max(box[2]-box[0],box[3]-box[1]);
	};

	var boxesIsIntersecting = function(box1,box2) {
		return box1[0] <= box2[2] && box1[2] >= box2[0] && box1[1] <= box2[3] && box1[3] >= box2[1];
	};

	var HGrid = function(width,mult) {
		this._width = width || 1;
		this._mult = mult || 4;		
		if(typeof(this._width) != 'number' || this._width <= 0)
			throw new Error('HGrid::constructor: bad "width" argument.');
		if(typeof(this._mult) != 'number' || this._mult <= 1)
			throw new Error('HGrid::constructor: bad "mult" argument.');
		this._powers = [];
		this._map = Object.create(null);
	};

	HGrid.prototype.insert = function(extent) {
		var data = this._makeExtentData(extent);
		if(data.values == null) {
			data.values = [];
			this._map[data.key] = data.values;
		} else {
			if(data.values.indexOf(extent) != -1)
				return false;
		}
		data.values.push(extent);
		data.power.count++;
		return true;
	};

	HGrid.prototype.remove = function(extent) {
		var data = this._makeExtentData(extent);
		if(data.values == null) 
			return false;
		var index = data.values.indexOf(extent);
		if(index == -1)
			return false;
		data.values.splice(index,1);
		if(data.values.length == 0)
			delete this._map[data.key];
		data.power.count--;
		return true;
	};

	HGrid.prototype.has = function(extent) {
		var data = this._makeExtentData(extent);
		return data.values != null && data.values.indexOf(extent) != -1;
	};

	HGrid.prototype.search = function(extent) {
		var result = [];
		for(var ip=0; ip < this._powers.length; ++ip) {
			var power = this._powers[ip];
			if(!power.count)
				continue;
			var lowCellIndex = makeCellIndex(extent[0],extent[1],power.width);
			var highCellIndex = makeCellIndex(extent[2],extent[3],power.width);
			lowCellIndex[0]--;
			lowCellIndex[1]--;
			for(var ix = lowCellIndex[0]; ix <= highCellIndex[0]; ++ix) {
				for(var iy = lowCellIndex[1]; iy <= highCellIndex[1]; ++iy) {
					var values = this._map[makeKey(ix,iy,ip)];
					if(values == null)
						continue;
					for(var i=0; i<values.length; ++i) {
						var value = values[i];				
						if(boxesIsIntersecting(extent,value))
							result.push(value);
					};
				};
			};
		};
		return result;
	};

	HGrid.prototype.clear = function() {
		this._powers = [];
		this._map = Object.create(null);
	};

	HGrid.prototype.all = function() {
		var result = [];
		for(var key in this._map) {
			var values = this._map[key];
			for(var i=0; i<values.length; ++i) {
		        	result.push(values[i]);
			}
		}
		return result;
	};

	HGrid.prototype._makePower = function(size) {
		var index = 0;
		var width = this._width;
		var power;
		while(true) {
			if(this._powers.length <= index) {
				power = {
					count: 0,
					width,
					index
				};
				this._powers.push(power);
			} else {
				power = this._powers[index];
			}
			if(size < power.width)
				return power;
			width *= this._mult;
			index++;
		};
	};

	HGrid.prototype._makeExtentData = function(extent) {
		var size = boxSize(extent);
		var power = this._makePower(size);
		var cellIndex = makeCellIndex(extent[0],extent[1],power.width);
		var key = makeKey(cellIndex[0],cellIndex[1],power.index);
		return {
			values: this._map[key],
			size,
			power,
			key
		};
	};

	exports = module.exports = HGrid;
});
