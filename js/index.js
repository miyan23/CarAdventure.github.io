// 显示时间
function getCountTime()
{
	let date=new Date()
	// 得到时分秒
	let h=date.getHours()
	let m=date.getMinutes()
	let s=date.getSeconds()
	// 格式化
	h=h<10 ? '0'+h : h
	m=m<10 ? '0'+m : m
	s=s<10 ? '0'+s : s

	// 把时分秒写到对应的span
	const hours=document.querySelector('#hours')
	const minutes=document.querySelector('#minutes')
	const seconds=document.querySelector('#seconds')
	hours.innerHTML=h
	minutes.innerHTML=m
	seconds.innerHTML=s
}

// 先调用一次
getCountTime()
// 开启定时器
setInterval(getCountTime,1000)