// 地图大小
var mapWidth;
var mapHeight;

// 地图块的像素大小
var blockWidth;
var blockHeight;

// 小车的初始位置-左上角
var carLeft;
var carTop;

// 小车的大小
var carWidth;
var carHeight;

// 存储小车信息
let carQueue = [];

// 存储障碍物信息
let blockQueue = [];

// 用户账号和权限
var userId;
var permission;

// 小车初始加载
document.getElementById('modifySetting').addEventListener('click', function () {
	var car = document.getElementById('car');

	// 获得地图大小
	var rangeMapSize = document.getElementById('rangeMapSize');
	mapWidth = parseInt(rangeMapSize.value, 10);
	mapHeight = parseInt(rangeMapSize.value, 10);

	// 获得地图的像素大小
	var middleElement = document.querySelector('.intent .middle');
	if (middleElement) {
		var middleWidth = middleElement.offsetWidth;
		var middleHeight = middleElement.offsetHeight;
	}
	// 获得地图块的像素大小
	blockWidth = middleWidth / mapWidth;
	blockHeight = middleHeight / mapHeight;

	// 设置小车的长宽
	if (blockWidth > blockHeight) {
		car.style.height = blockHeight + 'px';
		car.style.width = 'auto';
	}
	else {
		car.style.width = blockWidth + 'px';
		car.style.height = 'auto';
	}

	// 设置小车的位置
	var carElement = document.querySelector('.intent .middle #car');
	if (carElement) {
		carWidth = carElement.offsetWidth;
		carHeight = carElement.offsetHeight;

		carLeft = (blockWidth - carElement.offsetWidth) / 2;
		carTop = (blockHeight - carElement.offsetHeight) / 2;
	}

	// 初始小车移除
	car.style.left = -40 + 'px';
	car.style.top = -40 + 'px';

	// 隐藏第0辆小车
	car.style.zIndex = 0;
});

/**
 * 添加小车
 */
const wsAddCar = new WebSocket('ws://172.16.158.198:8080/websocket');
wsAddCar.onopen = function () {
	document.getElementById('addCarButton').addEventListener('click', function () {
		var newCar = document.createElement('img');
		newCar.src = './images/car.png';

		// 设置大小
		newCar.style.position = 'absolute';
		newCar.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';
		newCar.style.zIndex = 1;
		newCar.style.width = carWidth + 'px';
		newCar.style.height = carHeight + 'px';

		// 偏移位置
		var shiftCarWidth = Math.floor(Math.random() * (mapWidth + 0));
		var shiftCarHeight = Math.floor(Math.random() * (mapHeight + 0));

		// 设置约束
		if (shiftCarWidth > mapWidth - 1) {
			shiftCarWidth = mapWidth - 1;
		}
		if (shiftCarWidth < 0) {
			shiftCarWidth = 0;
		}
		if (shiftCarHeight > mapHeight - 1) {
			shiftCarHeight = mapHeight - 1;
		}
		if (shiftCarHeight < 0) {
			shiftCarHeight = 0;
		}

		// 偏移方向
		var shiftCarAngle = Math.floor(Math.random() * (4 + 0));
		var direction;
		switch (shiftCarAngle) {
			case 0:
				direction = "D";
				break;
			case 1:
				direction = "L";
				break;
			case 2:
				direction = "U";
				break;
			case 3:
				direction = "R";
				break;
			default:
		};

		// 设置初始位置和方向
		newCar.style.left = carLeft + shiftCarWidth * blockWidth + 'px';
		newCar.style.top = carTop + shiftCarHeight * blockHeight + 'px';
		newCar.style.transform = 'rotate(' + shiftCarAngle * 90 + 'deg)';

		// 配置id
		newCar.id = Date.now();

		// 把用户小车写入本地数据库
		userId = getSessionStorageItem('userId');
		const messagesDiv2 = document.getElementById('messages');
		messagesDiv2.innerHTML += `<p>${"账户: ID-" + userId}</p>`;
		messagesDiv2.scrollTop = messagesDiv2.scrollHeight;

		const wsWriteInit = new WebSocket('ws://localhost:8080');
		wsWriteInit.onopen = function (event) {
			const dataInit = {
				type: 'CAR_INIT',
				userId: userId,
				turns: 1,
				carId: newCar.id,
				xInit: shiftCarWidth,
				yInit: shiftCarHeight,
				angleInit: shiftCarAngle,
			}
			wsWriteInit.send(JSON.stringify(dataInit));
			wsWriteInit.close();
		}


		// id提示
		newCar.addEventListener('click', function () {
			const messagesDiv = document.getElementById('messages');
			messagesDiv.innerHTML += `<p>${"Car ID: " + this.id}</p>`;
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
		})

		// 创建一个对象存储小车信息
		const carInfo = {
			id: newCar.id,
		};
		// 将小车信息添加到队列中
		carQueue.push(carInfo);

		// 添加到父级容器
		document.getElementById('middle').appendChild(newCar);

		// 添加消息
		const messagesDiv = document.getElementById('messages');
		messagesDiv.innerHTML += `<p>${"小车添加成功: ID-" + newCar.id}</p>`;
		messagesDiv.innerHTML += `<p>${"x:" + shiftCarWidth + " y:" + shiftCarHeight}</p>`;
		messagesDiv.scrollTop = messagesDiv.scrollHeight;

		// 修改数量
		var carNumberElement = document.getElementById('carNumber');
		// 获取当前值并转换为整数
		var currentCarNumber = parseInt(carNumberElement.textContent || carNumberElement.innerText, 10);
		currentCarNumber++;
		carNumberElement.textContent = currentCarNumber.toString();

		// 发送小车信息
		const dataCar = {
			type: 'ADD_VEHICLE',
			carID: newCar.id,
			x: shiftCarWidth,
			y: shiftCarHeight,
			dir: direction,
			task: '',
		};
		wsAddCar.send(JSON.stringify(dataCar));

		// 达到最大数量后禁用按钮
		var rangeCarNum = document.getElementById('rangeCarNum');
		if (rangeCarNum.value == currentCarNumber) {
			document.getElementById('addCarButton').disabled = true;
		}
	});
};

/**
 * 添加障碍物
 */
const wsAddBlock = new WebSocket('ws://172.16.158.198:8080/websocket');
wsAddBlock.onopen = function () {
	document.getElementById('addBlockButton').addEventListener('click', function () {
		var newBlock = document.createElement('img');
		newBlock.src = './images/block.jpg';

		newBlock.style.position = 'absolute';
		newBlock.style.zIndex = 1;

		newBlock.style.width = blockWidth + 'px';
		newBlock.style.height = blockHeight + 'px';
		newBlock.style.left = 100 + 'px';
		newBlock.style.top = 100 + 'px';

		var shiftBlockWidth = Math.floor(Math.random() * (mapWidth + 1));
		var shiftBlockHeight = Math.floor(Math.random() * (mapHeight + 1));

		if (shiftBlockWidth > mapWidth - 1) {
			shiftBlockWidth = mapWidth - 1;
		}
		if (shiftBlockWidth < 0) {
			shiftBlockWidth = 0;
		}
		if (shiftBlockHeight > mapHeight - 1) {
			shiftBlockHeight = mapHeight - 1;
		}
		if (shiftBlockHeight < 0) {
			shiftBlockHeight = 0;
		}

		newBlock.style.left = shiftBlockWidth * blockWidth + 'px';
		newBlock.style.top = shiftBlockHeight * blockHeight + 'px';

		// 配置id
		newBlock.id = Date.now();

		document.getElementById('middle').appendChild(newBlock);

		// 创建一个对象存储小车信息
		const blockInfo = {
			id: newBlock.id,
		};
		blockQueue.push(blockInfo);

		const messagesDiv = document.getElementById('messages');
		messagesDiv.innerHTML += `<p>${"障碍物添加成功"}</p>`;
		messagesDiv.innerHTML += `<p>${"x:" + shiftBlockWidth + " y:" + shiftBlockHeight}</p>`;
		messagesDiv.scrollTop = messagesDiv.scrollHeight;

		// 修改数量
		var blockNumberElement = document.getElementById('blockNumber');
		// 获取当前值并转换为整数
		var currentBlockNumber = parseInt(blockNumberElement.textContent || blockNumberElement.innerText, 10);
		currentBlockNumber++;
		blockNumberElement.textContent = currentBlockNumber.toString();

		// 发送障碍物位置
		const dataBlock = {
			type: 'ADD_BLOCK',
			x: shiftBlockWidth,
			y: shiftBlockHeight,
		};
		wsAddBlock.send(JSON.stringify(dataBlock));

		// 达到最大数量后禁用按钮
		var rangeBlockNum = document.getElementById('rangeBlockNum');
		if (rangeBlockNum.value == currentBlockNumber) {
			document.getElementById('addBlockButton').disabled = true;
		}
	})
};

/**
 * 开始探索
 */
let startCarInfo=null;
const wsLogic = new WebSocket('ws://172.16.158.198:8080/websocket');
wsLogic.onopen = function () {
	document.getElementById('startExplore').addEventListener('click', function () {
		startCarInfo=setInterval(function () {
			console.log('请求小车中!')

			console.log('请求小车定时器:',startCarInfo);
			if(startCarInfo==null){
				return;
			}

			document.getElementById('pauseExplore').addEventListener('click',function(){
				startCarInfo=null;
				return;
			})

			const dataCar = {
				type: 'GET_VEHICLE_INFO',
			};

			// 发送请求
			wsLogic.send(JSON.stringify(dataCar));

			// 接收车辆信息
			wsLogic.onmessage = function (event) {
				const dataModify = JSON.parse(event.data);

				for (let i = 0; i < dataModify.length; i++) {
					var carModify = document.getElementById(dataModify[i].id);
					carModify.style.left = carLeft + dataModify[i].x * blockWidth + 'px';
					carModify.style.top = carTop + dataModify[i].y * blockHeight + 'px';

					var direction = dataModify[i].dir;
					var shiftCarAngle;
					switch (direction) {
						case "D":
							shiftCarAngle = 0;
							break;
						case "L":
							shiftCarAngle = 1;
							break;
						case "U":
							shiftCarAngle = 2;
							break;
						case "R":
							shiftCarAngle = 3;
							break;
						default:
					};
					carModify.style.transform = 'rotate(' + shiftCarAngle * 90 + 'deg)';

					// 把小车坐标写入本地回放数据库
					const wsWritePosition = new WebSocket('ws://localhost:8080');
					wsWritePosition.onopen = function (event) {
						const dataPosition = {
							type: 'CAR_POSITION',
							carId: dataModify[i].id,
							xPosition: dataModify[i].x,
							yPosition: dataModify[i].y,
							angleShift: shiftCarAngle,
						}

						wsWritePosition.send(JSON.stringify(dataPosition));
						wsWritePosition.close();
					}
				}
			};
		}, 200);
	})
}

/**
 * 暂停探索
 */
const wsPause = new WebSocket('ws://172.16.158.198:8080/websocket');
wsPause.onopen = function () {
	document.getElementById('pauseExplore').addEventListener('click', function () {
		const dataPause = {
			type: 'PAUSE_EXPLORE',
		};
		wsPause.send(JSON.stringify(dataPause));
	})
}

/**
 * 结束探索
 */
const wsEnd = new WebSocket('ws://172.16.158.198:8080/websocket');
wsEnd.onopen = function () {
	document.getElementById('endExplore').addEventListener('click', function () {
		const dataEnd = {
			type: 'END_EXPLORE',
		};
		wsEnd.send(JSON.stringify(dataEnd));
		if (confirm('你真的忍心离开芙莉莲吗？')) {
			window.close();
		}
	})
}

/**
 * 回放探索
 */
document.getElementById('playBack').addEventListener('click', function () {
	var popup = document.getElementById('popup');
	popup.style.display = 'flex';
});

/**
 * 提交回放设置
 */
const wsReview = new WebSocket('ws://localhost:8080');
wsReview.onopen = function (event) {
	console.log('Connected to WebSocket server.');

	document.getElementById('submitInfo').addEventListener('click', function () {
		var userId = document.getElementById('userId').value;
		var turns = document.getElementById('turns').value;
		var carId = document.getElementById('carId').value;

		console.log('User ID:', userId, 'Turns:', turns, 'Car ID:', carId);

		const messagesDiv = document.getElementById('messages');
		messagesDiv.innerHTML += `<p>${"回放设置成功"}</p>`;
		messagesDiv.innerHTML += `<p>${"User ID:" + userId + " Turns:" + turns + " Car ID:" + carId}</p>`;
		messagesDiv.scrollTop = messagesDiv.scrollHeight;

		const dataReview = {
			type: 'REVIEW',
			userId: userId,
			turns: turns,
			carId: carId,
		};
		wsReview.send(JSON.stringify(dataReview));

		wsReview.onmessage = function (event) {
			console.log('Received message:', event.data);

			const dataModify = JSON.parse(event.data);

			// 根据收到的数据做不同反应
			if (dataModify.type == 'NEXT_POSITION') {
				console.log('下一步的位置是:', dataModify.xPosition, dataModify.yPosition, dataModify.angleShift);
				var xPosition = dataModify.xPosition;
				var yPosition = dataModify.yPosition;
				var angleShift = dataModify.angleShift;

				// 让小车走一步
				var carModify = document.getElementById(carId);

				carModify.style.left = carLeft + xPosition * blockWidth + 'px';
				carModify.style.top = carTop + yPosition * blockHeight + 'px';
				carModify.style.transform = 'rotate(' + angleShift * 90 + 'deg)';

			} else if (dataModify.type == 'INIT_POSITION') {
				console.log('小车的初始位置是:' + dataModify.xInit + ',' + dataModify.yInit + ',' + dataModify.angleInit);
				var xInit = dataModify.xInit;
				var yInit = dataModify.yInit;
				var angleInit = dataModify.angleInit;

				// 创建一张车的图片
				var newCar = document.createElement('img');
				newCar.src = './images/car.png';

				// 设置大小
				newCar.style.position = 'absolute';
				newCar.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';
				newCar.style.zIndex = 1;
				newCar.style.width = carWidth + 'px';
				newCar.style.height = carHeight + 'px';

				// 初始位置
				newCar.style.left = carLeft + xInit * blockWidth + 'px';
				newCar.style.top = carTop + yInit * blockHeight + 'px';
				newCar.style.transform = 'rotate(' + angleInit * 90 + 'deg)';

				// 配置id
				newCar.id = carId;

				// 添加到父级容器
				document.getElementById('middle').appendChild(newCar);
			}
		};

		// 关闭弹窗
		popup.style.display = 'none';
	})
};

/**
 * 从SessionStorage获取数据
 */
function getSessionStorageItem(key) {
	const valueStr = sessionStorage.getItem(key);

	try {
		return JSON.parse(valueStr);
	} catch (e) {
		return valueStr;
	}
}

/**
 * 头像设置
 */
document.addEventListener('DOMContentLoaded', function () {
	var imageUrl = getSessionStorageItem('image');

	var earth = document.getElementById('earth');
	earth.style.backgroundImage = 'url("' + imageUrl + '")';
})

/**
 * 清空地图
 */
const wsClear = new WebSocket('ws://172.16.158.198:8080/websocket');
wsClear.onopen = function () {
	document.getElementById('clearAll').addEventListener('click', function () {
		const dataClear = {
			type: 'CLEAN_MAP',
		};
		wsClear.send(JSON.stringify(dataClear));

		// 清空小车和障碍物
		var middleParent = document.getElementById('middle');
		for (let i = 0; i < carQueue.length; i++) {
			var carDelete = document.getElementById(carQueue[i].id);
			middleParent.removeChild(carDelete);
		}
		console.log(blockQueue);
		for (let i = 0; i < blockQueue.length; i++) {
			var blockDelete = document.getElementById(blockQueue[i].id);
			middleParent.removeChild(blockDelete);
		}
	})
}

/**
 * 用户管理
 */
const users = [
	{ username: 'user1', password: 'pass1', role: 'admin' },
	{ username: 'user2', password: 'pass2', role: 'user' },
];
const wsUserManage = new WebSocket('ws://172.16.158.198:8080/websocket');
wsUserManage.onopen = function () {
	document.getElementById('userManage').addEventListener('click', function () {
		var userManage = document.getElementById('manageDisplay');
		var isDisplayed = userManage.style.display == 'block';

		if (isDisplayed) {
			userManage.style.display = 'none';
		} else {
			userManage.style.display = 'block';

			// 请求用户数据
			const dataUser = {
				type: 'GET_PAGE',
			}
			wsUserManage.send(JSON.stringify(dataUser));

			wsUserManage.onmessage = function (event) {
				console.log('Received message:', event.data);

				const dataUserAll = JSON.parse(event.data);

				console.log(dataUserAll);

				users.length = 0;
				for (let i = 0; i < dataUserAll.length; i++) {
					console.log(dataUserAll[i].permission);

					const newUser = { userAccount: dataUserAll[i].username, role: dataUserAll[i].permission };
					users.push(newUser);

					console.log(users);
				}
			}

			// 加载用户列表
			const userList = document.getElementById('userList');
			userList.innerHTML = '';

			// 遍历用户数组，为每个用户创建一个列表项  
			users.forEach(user => {
				// 创建一个列表项  
				const listItem = document.createElement('li');
				listItem.className = 'user-item';

				// 设置列表项的内容 
				listItem.textContent = `账户: ${user.userAccount}, 权限: ${user.role}`;

				// 创建删除按钮
				const deleteButton = document.createElement('button');
				deleteButton.className = 'user-delete';
				deleteButton.textContent = '删除';
				deleteButton.onclick = () => deleteUser(user.userAccount);

				// 创建修改按钮
				const modifyButton = document.createElement('button');
				modifyButton.className = 'user-modify';
				modifyButton.textContent = '修改';
				modifyButton.onclick = () => modifyButton(user.userAccount);

				// 将按钮添加到列表项中
				listItem.appendChild(deleteButton);
				listItem.appendChild(document.createTextNode(' '));
				listItem.appendChild(modifyButton);

				// 将列表项添加到列表中 
				userList.appendChild(listItem);
			});
		}
	})
}

/**
 * 删除用户
 */
function deleteUser(userAccount) {
	console.log(`Deleting user with ID: ${userAccount}`);

	const wsUserDelete = new WebSocket('ws://172.16.158.198:8080/websocket');
	wsUserDelete.onopen = function () {
		const dataUserDelete = {
			type: 'USER_DELETE',
		};

		wsUserDelete.send(JSON.stringify(dataUserDelete));
		wsUserDelete.close();
	}
}

/**
 * 修改用户
 */
function modifyUser(userAccount) {
	console.log(`Modifying user: ${userAccount}`);

	const wsUserModify = new WebSocket('ws://172.16.158.198:8080/websocket');
	wsUserModify.onopen = function () {
		const dataUserModify = {
			type: 'USER_MODIFY',
		};

		wsUserModify.send(JSON.stringify(dataUserModify));
		wsUserModify.close();
	}
}

/**
 * 数据图
 */
// 基于准备好的dom，初始化echarts实例
var myChartLine = echarts.init(document.getElementById('bar'), null,
	{
		// height:160
	});

/**
 * 初始化图表数据
 */
let data1 =
	[

	]
let data2 =
	[

	]
let data3 = []
let dataX = [];
var rangeCarNum = document.getElementById('rangeCarNum');
for (let i = 0; i < rangeCarNum.value; i++) {
	console.log('rangeCarNum.value:'+rangeCarNum.value);
	data1[i] = 10;
	data2[i] = 10;
	data3[i] = (data1[i] + data2[i]) / 2;
	dataX[i] = i + 1;
}

option =
{
	// 鼠标悬浮数据提示
	tooltip:
	{
		trigger: 'axis',
		axisPointer:
		{
			type: 'cross',
			label:
			{
				backgroundColor: '#283b56'
			}
		}
	},
	grid:
	{
		top: 18,
		left: 26,
		right: 26,
		bottom: 16,
	},
	xAxis:
		[
			{
				type: 'category',
				data: dataX,
				axisPointer:
				{
					type: 'shadow'
				},
				axisLabel:
				{
					// 调整字体
					textStyle:
					{
						color: '#A1C7E1',
						fontSize: '8'
					}
				},
				// 刻度线
				axisTick:
				{
					show: false,
				},
			}
		],
	yAxis:
		[
			{
				type: 'value',
				name: '搜索：ms',
				nameGap: 8,
				nameTextStyle:
				{
					color: '#A1C7E1',
					fontSize: '8'
				},
				// 调整背景横线
				splitLine:
				{
					show: true,
					lineStyle:
					{
						color: '#8BE6FF',
						type: 'dashed',
						width: 1,
						// 透明度
						opacity: 0.1
					}
				},
				min: 0,
				max: 500,
				// 数据间隔
				interval: 100,
				axisLabel:
				{
					// 调整字体
					textStyle:
					{
						color: '#A1C7E1',
						fontSize: '8'
					}
				}
			},
			{
				type: 'value',
				name: '运行：ms',
				nameGap: 8,
				nameTextStyle:
				{
					color: '#A1C7E1',
					fontSize: '8'
				},
				// 调整背景横线
				splitLine:
				{
					show: true,
					lineStyle:
					{
						color: '#8BE6FF',
						type: 'dashed',
						width: 1,
						// 透明度
						opacity: 0.1
					}
				},
				min: 0,
				max: 50,
				interval: 10,
				axisLabel:
				{
					// 调整字体
					textStyle:
					{
						color: '#A1C7E1',
						fontSize: '8'
					}
				}
			}
		],
	// 控制缩放
	dataZoom: [
		{
			type: 'inside'
		}
	],
	series:
		[
			{
				type: 'bar',
				// 调整渐变
				itemStyle:
				{
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
						[
							{ offset: 0, color: '#EDDEAC' },
							{ offset: 1, color: '#D3893D' },
						])
				},
				data: data1
			},
			{
				type: 'bar',
				itemStyle:
				{
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
						[
							{ offset: 0, color: '#6D623C' },
							{ offset: 1, color: 'rgba(109, 98, 60, 0)' },
						])
				},
				data: data2
			},
			{
				type: 'line',
				yAxisIndex: 1,
				// 调整节点大小
				symbolSize: 6,
				// 调整节点样式
				itemStyle:
				{
					color: '#EDDEAC',
				},
				lineStyle:
				{
					color: '#FFE8C1',
				},
				data: data3
			}
		]
};

/**
 * 开始探索之后请求小车性能数据
 */
let startTime;
var index=0;
const wsTime = new WebSocket('ws://172.16.158.198:8080/websocket');
wsTime.onopen = function () {
	document.getElementById('startExplore').addEventListener('click', function () {

		startTime = setInterval(function () {
				if(startTime==null){
					return;
				}

				const dataCarTime = {
					type: 'GET_CAR_TIME',
					carID: carQueue[index].id,
				};

				wsTime.send(JSON.stringify(dataCarTime));

				wsTime.onmessage = function (event) {
					const data = JSON.parse(event.data);

					data1[index] = parseInt(data.searchTime);
					data2[index] = parseInt(data.runTime);
					data3[index] = (data1[index] + data2[index]) / 2;

					console.log(index,carQueue[index].id,data.searchTime,data.runTime);
				}

				console.log(data1,data2,data3);

				myChartLine.setOption(
					{
						series:
							[
								{
									data: data1
								},
								{
									data: data2
								},
								{
									data: data3
								}
							]
					});

				index++;
				if(index>=carQueue.length){
					index=0;
				}
		}, 200);
	})
}

/**
 * 暂停请求
 */
document.getElementById('pauseExplore').addEventListener('click', function () {
	clearInterval(startTime);
	startTime=null;
})

// 使用刚指定的配置项和数据显示图表。
myChartLine.setOption(option)

/**
 * 设置权限
 */
document.addEventListener('DOMContentLoaded', function () {
	permission = getSessionStorageItem('permission');
	console.log('当前用户的权限为:'+permission);

	switch (permission) {
		case 1:
			document.getElementById('userManage').disabled = true;
			break;
		case 2:
			document.getElementById('userManage').disabled = true;
			break;
		case 3:
			break;
		default:
	}
})