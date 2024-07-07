/**
 * 滑动条设置
 */
document.getElementById('rangeCarNum').addEventListener('input', function () {
	// 获取滑动条的值  
	var value = this.value;
	// 更新显示值的元素  
	document.getElementById('valueCarNum').textContent = value;
});

document.getElementById('rangeBlockNum').addEventListener('input', function () {
	// 获取滑动条的值  
	var value = this.value;
	// 更新显示值的元素  
	document.getElementById('valueBlockNum').textContent = value;
});

document.getElementById('rangeMapSize').addEventListener('input', function () {
	// 获取滑动条的值  
	var value = this.value;
	// 更新显示值的元素  
	document.getElementById('valueMapSize').textContent = value;
});

document.getElementById('rangeTaskTime').addEventListener('input', function () {
	// 获取滑动条的值  
	var value = this.value;
	// 更新显示值的元素  
	document.getElementById('valueTaskTime').textContent = value;
});

/**
 * 发送设置
 */
const wsRange = new WebSocket('ws://172.16.158.198:8080/websocket');
wsRange.onopen = function () {
	document.getElementById('modifySetting').addEventListener('click', function () {
		// 获取每个input的引用并读取其value  
		var rangeCarNum = document.getElementById('rangeCarNum');
		var rangeBlockNum = document.getElementById('rangeBlockNum');
		var rangeMapSize = document.getElementById('rangeMapSize');
		var rangeTaskTime = document.getElementById('rangeTaskTime');

		// 发送设置
		const dataSetting = {
			type: 'CONFIG',
			carNum: rangeCarNum.value,
			blockNum: rangeBlockNum.value,
			mapSize: rangeMapSize.value,
			taskTime: rangeTaskTime.value,
		};
		wsRange.send(JSON.stringify(dataSetting));

		// 添加消息
		const messagesDiv = document.getElementById('messages');
		messagesDiv.innerHTML += `<p>${"设置消息已发送!"}</p>`;
		messagesDiv.scrollTop = messagesDiv.scrollHeight;

		// 禁用悬停动画  
		if (!this.classList.contains('clicked')) {
			// 添加 clicked 类以禁用悬停动画  
			this.classList.add('clicked');
		}

		// 禁用按钮
		this.disabled = true;

		// 开启操作按钮
		document.getElementById('addCarButton').disabled = false;
		document.getElementById('addBlockButton').disabled = false;
		document.getElementById('startExplore').disabled = false;
		document.getElementById('pauseExplore').disabled = false;
		document.getElementById('endExplore').disabled = false;
		document.getElementById('clearAll').disabled = false;
		document.getElementById('playBack').disabled = false;

		// 禁用input输入
		document.getElementById('rangeCarNum').disabled = true;
		document.getElementById('rangeBlockNum').disabled = true;
		document.getElementById('rangeMapSize').disabled = true;
		document.getElementById('rangeTaskTime').disabled = true;
	})
};