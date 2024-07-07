/**
 * 注册按钮
 */
var isRegist = false;
document.getElementById('accountRegist').addEventListener('click', function () {
	isRegist = true;

	var loginButton = document.getElementById('accountLogin');
	var registButton = document.getElementById('accountRegist');
	loginButton.style.fontSize = 1.02 + 'vw';
	registButton.style.fontSize = 1.32 + 'vw';

	var line2 = document.getElementById('line2');
	line2.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';
	line2.style.left = 9.6 + 'vw';

	var showNone = document.getElementById('showNone');
	showNone.style.display = 'none';

	var sendLogin = document.getElementById('sendLogin');
	sendLogin.innerText = '注册';

	var middleInput = document.getElementById('middleInput');
	var identify = document.getElementById('identify');
	var confirm = document.getElementById('confirm');

	if (middleInput && identify && confirm) {
		middleInput.removeChild(identify);
		middleInput.removeChild(confirm);

		middleInput.appendChild(confirm);
		middleInput.appendChild(identify);

		confirm.style.display = 'block';
	}
})

/**
 * 登录按钮
 */
function toggleLoginMode() {
	isRegist = false;

	var loginButton = document.getElementById('accountLogin');
	var registButton = document.getElementById('accountRegist');
	loginButton.style.fontSize = 1.32 + 'vw';
	registButton.style.fontSize = 1.02 + 'vw';

	var line2 = document.getElementById('line2');
	line2.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';
	line2.style.left = 1.58 + 'vw';

	var confirm = document.getElementById('confirm');
	confirm.style.display = 'none';

	var sendLogin = document.getElementById('sendLogin');
	sendLogin.innerText = '登录';

	var middleInput = document.getElementById('middleInput');
	var showNone = document.getElementById('showNone');
	var identify = document.getElementById('identify');

	if (middleInput && showNone && identify) {
		middleInput.removeChild(showNone);
		middleInput.removeChild(identify);

		middleInput.appendChild(identify);
		middleInput.appendChild(showNone);

		showNone.style.display = 'flex';
	}
}

document.getElementById('accountLogin').addEventListener('click', toggleLoginMode);

/**
 * 人机验证
 */
var btn = document.getElementById('btn');
var btnbox = document.getElementById('btnbox');
var left;
var isVerified = false;
btn.onmousedown = function (event) {
	var x = event.clientX - btnbox.offsetLeft;
	document.onmousemove = function (event) {
		var x1 = event.clientX - x;
		btnbox.style.left = x1 + 'px';
		left = x1;
	}

	document.onmouseup = function () {
		document.onmousedown = null;
		document.onmousemove = null;

		let windowWidth = window.innerWidth;

		if (!isVerified) {
			if (left > -(0.0951 * windowWidth) && left < -(0.08547 * windowWidth)) {
				isVerified = true;
				alert("验证通过 现在可以登录啦!");

				var machine = document.getElementById('box');
				machine.style.display = 'none';

				document.getElementById('identify').disabled = true;
			} else {
				alert("验证失败 请重试");

				btnbox.style.left = 0 + 'px'
			}
		}
	}
}

/**
 * 点击验证
 */
document.getElementById('identify').addEventListener('click', function () {
	var account = document.getElementById('account').value;
	var password = document.getElementById('password').value;

	if (account.trim() == "") {
		alert("账号不能为空!");
		return;
	}
	if (password.trim() == "") {
		alert("密码不能为空!");
		return;
	}
	if (password.length < 12) {
		alert("密码长度不能小于12!");
		return;
	}
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
	if (!regex.test(password)) {
		alert("密码必须包含大小写字母和数字!");
		return;
	}

	var machine = document.getElementById('box');
	machine.style.display = 'block';
})

/**
 * 发送注册信息或登录信息
 */
var dataReturn;
let sendInterval;
const wsSend = new WebSocket('ws://172.16.158.198:8080/websocket');
wsSend.onopen = function () {
	document.getElementById('sendLogin').addEventListener('click', function () {
		if (!isVerified) {
			alert('请先进行人机验证');
		} else if (isRegist) {

			sendInterval = setInterval(function () {
				if(sendInterval==null){
					return;
				}

				var account = document.getElementById('account').value;
				var password = document.getElementById('password').value;
				var identityString = document.getElementById('confirm').value;

				var identityInt;
				switch (identityString) {
					case "ordinaryUser":
						identityInt = 1;
						break;
					case "experimenter":
						identityInt = 2;
						break;
					case "superman":
						identityInt = 3;
						break;
					default:
				};

				const dataRegist = {
					type: 'USER_REGISTER',
					username: account,
					password: password,
					permission: identityInt,
				}

				wsSend.send(JSON.stringify(dataRegist));

				wsSend.onmessage = function (event) {
					dataReturn = event.data;
					switch (dataReturn) {
						case "0":
							toggleLoginMode();
							alert('注册成功 请重新登录!');
							break;
						case "1":
							alert('权限不在范围内!');
							break;
						case "2":
							alert('账户重复 请修改注册账户!');
						case "3":
							alert('注册失败 请重试!');
						case "4":
							alert('数据库抛出异常!');
							break;
						default:
					}
				}

				clearInterval(sendInterval);
				sendInterval = null;
			}, 5000);

		} else if (!isRegist) {

			sendInterval = setInterval(function () {
				if(sendInterval==null){
					return;
				}

				var account = document.getElementById('account').value;
				var password = document.getElementById('password').value;

				const dataLogin = {
					type: 'USER_LOGIN',
					username: account,
					password: password,
				}

				wsSend.send(JSON.stringify(dataLogin));

				wsSend.onmessage = function (event) {
					dataReturn = JSON.parse(event.data);

					setSessionStorageItem('image', dataReturn.image);
					setSessionStorageItem('permission', dataReturn.permission);
					setSessionStorageItem('userId', account);

					var tip = dataReturn.username;
					switch (tip) {
						case "0":
							window.location.href = `./index.html`;
							break;
						case "-1":
							alert('密码错误!');
							break;
						case "-2":
							alert('用户名不存在!');
						case "-3":
							alert('登录失败!');
						default:
					}
				}

				clearInterval(sendInterval);
				sendInterval = null;
			}, 5000);
		}
	})
}

/**
 * 限制输入内容
 * 只能输入字母和数字
 */
document.getElementById('account').addEventListener('input', function (e) {
	this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
})

document.getElementById('password').addEventListener('input', function (e) {
	this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
})

/**
 * 存储数据到SessionStorage
 */
function setSessionStorageItem(key, value) {
	const valueStr = JSON.stringify(value);

	// 存储数据
	sessionStorage.setItem(key, valueStr);
}