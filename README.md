## hgrid

A small-sized simplistic JavaScript library for 2d spatial search of axis-aligned rectangle objects(extents).

## Usage

### Extent
Extent is a JavaScript Array or Array-like object that should have 4 numbers describing bottom left and top right points of an axis-aligned rectangle.
```js
// Rectangle with bottom left point (2, 3) and top right point (16.1, 6):
var extent = [2, 3, 16.1, 6]; // [minX,minY,maxX,maxY]
```

If you need to add extra info, you can use any other indexes or object properties, except 0,1,2,3:
```js
var extentWithInfo = [2, 3, 16.1, 6, { data1: 'somedata' }, 'data 2'];
extentWithInfo.id = 10;
```

### Create HGrid
HGrid constructor has two parameters which can affect the performance.
```js
var HGrid = require('hgrid');
var width = 0.1;
var mult = 2;
var hg = new HGrid(width,mult);
```
The first one is 'width'. It is the smallest grid cell's size. It should be chosen as small as possible, but slightly greater than the size of most of extents you insert into the grid.
If 90% of your extents sizes are below 10, but some has greater size, you can try 10 as 'width'.
If you use point-like extents ([x,y,x,y]), choose 'width' as big as possible but so that the probability of two extents are closer than 'width' is small enough.
In any case, you should try different values and benchmark to find the optimal value.
Size of the extent [x0,y0,x1,y1] is Max(x1-x0,y1-y1).
Default value for parameter 'width' is 1.

The second parameter is 'mult'. It's a multiplier that is used to create series of grids to accomodate inserted extent's size.
First grid with smallest cell uses 'width' value as it's cell size. Other grids has cell size 'width' multiplied by 'mult'^p, where p>0 is some integer.
For example, if width = 10 and mult = 2, than grids has the following cell sizes: 10, 20, 40, 80, etc.
Default value for parameter 'mult' is 4.

### Insert
To insert extent into the grid, use 'insert' function:
```js
hg.insert(extent);
```
If you insert the extent, that has already been inserted, nothing happens (no duplicates alowed).
The equality of extents is determined by their identity. I.e. you can insert different extents with same properties.
```js
var extent1 = [1,2,3,4];
var extent2 = [1,2,3,4];
hg.insert(extent1); // inserts extent1
hg.insert(extent1); // does nothing!
hg.insert(extent2); // inserts extent2
```
You must remember that you should not mutate spatial properties(extent[0] - extent[3]) of extent while it is inside any HGrid.
To move extent, first you need to remove it from HGrid. After changing spatial properties, add it to the HGrid again.
Notice that you can change any other (non-spatial) properties without removing the extent.

### Remove
To remove extent from the grid, use 'remove' function:
```js
hg.remove(extent1);
```
Extent is removed by identity, not by its properties:
```js
var extent3 = [1,2,3,4];
var extent4 = [1,2,3,4];
hg.insert(extent3);
hg.remove(extent4); // does nothing!
hg.remove(extent3); // removes extent3
```

### Check existence
You can check whether extent has been added to the grid with 'has' method. Again, it uses identity to check equality:
```js
var extent1 = [1,2,3,4];
var extent2 = [1,2,3,4];
hg.insert(extent1);
console.log(hg.has(extent1)); // true
console.log(hg.has(extent2)); // false
hg.remove(extent1);
console.log(hg.has(extent1)); // false
```

### Search
You can use 'search' to find extents intersecting with given one:
```js
var r = hg.search([0,0,10,20]);
```
Return value of 'search' is always an Array. If none of the intersecting extents is found, it returns empty array.
When determining the fact of intersection of extents, the bottom and left edges considered inclusive, and the top and right are exclusive.

### Clear
You can clear the grid (remove all inserted extents) by 'clear':
```js
hg.clear();
```
### All
To get the array of every inserted extent, use 'all':
```js
var a = hg.all();
```
