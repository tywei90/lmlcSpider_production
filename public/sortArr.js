// 删除数组指定项(index)
exports.delArrByIndex = function (arr, indexArr) {
	if (arr.length === 0) {
		return [];
	}
	for (var i = 0, len = indexArr.length; i < len; i++) {
		arr.splice(indexArr[i] - i, 1);
	}
};
// 选出对象数组某个属性值最大的对象组成的数组
exports.maxObjArr = function (arr, sortType) {
	var maxData;
	var tmpArr = [];
	var outArr = [];
	if (arr.length === 0) {
		return [];
	}
	for(var i=0,len=arr.length; i<len; i++){
		tmpArr.push(arr[i][sortType]);
	}
	maxData = maxNum(tmpArr);
	for(var i=0,len=arr.length; i<len; i++){
		if (arr[i][sortType] === maxData) {
			outArr.push(arr[i]);
		}
	}
	return outArr
	// 选出数字组成的数组中最大值
	function maxNum(array) {
		return Math.max.apply({}, array)
	}
};
// 选出对象数组某个属性值最小的对象组成的数组
exports.minObjArr = function (arr, sortType) {
	var minData;
	var tmpArr = [];
	var outArr = [];
	if (arr.length === 0) {
		return [];
	}
	for(var i=0,len=arr.length; i<len; i++){
		tmpArr.push(arr[i][sortType]);
	}
	minData = minNum(tmpArr);
	for(var i=0,len=arr.length; i<len; i++){
		if (arr[i][sortType] === minData) {
			outArr.push(arr[i]);
		}
	}
	return outArr
	// 选出数字组成的数组中最小值
	function minNum(array) {
		return Math.min.apply({}, array)
	}
};
// 多重条件数组筛选方法
exports.multiSortArr = function(arr, sortLists) {
	var me = this;
	var i = 0;
	var len = sortLists.length;
	var inArr = arr;
	var outArr = [];
	if (inArr.length === 0) {
		return [];
	}
	// 严格模式下arguments.callee正确的使用姿势
	var sortArr = (function sortArrWrap(arr, sortList) {
			var filterArr = [];
			if (arr.length === 0) {
				return;
			}
			if (sortList.positive === false) {
				filterArr = me.maxObjArr(arr, sortList.name);
			} else {
				filterArr = me.minObjArr(arr, sortList.name);
			}
			if (filterArr.length === 1 || i >= len - 1) {
				outArr = outArr.concat(filterArr);
				// 删除原来数组中的对应项
				for(var k=0,len1=filterArr.length; k<len1; k++){
					// 每次查找到一个就删除原数组对应项，并更新stringifyInArr，防止有多个相同元素，导致删除错误
					var stringifyInArr = [];
					for(var j=0,len2=inArr.length; j<len2; j++){
						stringifyInArr.push(JSON.stringify(inArr[j]));
					}
					var delIndex = stringifyInArr.indexOf(JSON.stringify(filterArr[k]));
					if (delIndex !== -1) {
						me.delArrByIndex(inArr, [delIndex]);
					}
				}
			} else {
				i++;
				sortArrWrap(filterArr, sortLists[i])
			}
		})
		// 严格模式下arguments.callee正确的使用姿势
	var loopSortArr = (function loopSortArrWrap() {
		i = 0;
		sortArr(inArr, sortLists[0]);
		if (inArr.length === 0) {
			return
		}
		loopSortArrWrap();
	})
	loopSortArr();
	return outArr;
}
