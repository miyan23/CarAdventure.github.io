// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('map'));

/**
 * 初始化地图数据
 */
const xData = [];
const yData = [];
const data = [];

var mapSize;

// 修改设置后初始化地图大小
document.getElementById('modifySetting').addEventListener('click', function () {
  // 获取地图大小
  mapSize = document.getElementById('rangeMapSize').value;

  // 地图数据初始赋值
  for (let i = 0; i < mapSize; i++) {
    xData[i] = i;
    yData[i] = i;
  }

  var index = 0;
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      data[index] = [i, j, 0];
      index++;
    }
  }

  myChart.setOption
    ({
      series:
        [
          {
            data: data
          }
        ]
    });
})

// 指定图表的配置项和数据
var option =
{
  tooltip:
  {
    position: 'top',
    formatter: function (params) {
      var adjustY = mapSize - 1 - params.data[1];
      return `x : ${params.data[0]} - y : ${adjustY} - explore : ${params.data[2]}`;
    }
  },
  grid:
  {
    width: 'auto',
    height: 'auto',
    left: '0%',
    right: '0%',
    top: '0%',
    bottom: '0%',
  },
  xAxis:
  {
    type: 'category',
    data: xData,
    splitArea:
    {
      show: true
    },
    // 隐藏x轴的线条
    axisLine:
    {
      show: false
    },
    // 隐藏x轴的小刻度
    axisTick:
    {
      show: false
    },
    // 隐藏x轴的刻度标签
    axisLabel:
    {
      show: false
    }
  },
  yAxis:
  {
    type: 'category',
    data: yData,
    splitArea:
    {
      show: true
    },
    // 隐藏y轴的线条
    axisLine:
    {
      show: false
    },
    // 隐藏y轴的小刻度
    axisTick:
    {
      show: false
    },
    // 隐藏y轴的刻度标签
    axisLabel:
    {
      show: false
    }
  },
  visualMap:
  {
    min: 0,
    max: 1,
    pieces: [
      { min: 0, max: 0, color: 'rgba(14, 88, 99, 0.9)' },
      { min: 1, max: 1, color: 'rgba(255, 255, 255, 0.2)' },
    ],
    calculable: false,
    orient: 'vertical',
    left: '10%',
    top: '20%',
    // 隐藏颜色条
    show: false,
  },
  series:
    [
      {
        name: 'Exploratory degrees',
        type: 'heatmap',
        data: data,
        // 不显示标签
        label:
        {
          show: false
        },
        // 高亮悬停样式
        emphasis:
        {
          itemStyle:
          {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            color: 'rgba(0, 0, 0, 0)',
          }
        }
      }
    ],
};

/**
 * 绘图定时器在开始探索后打开
 */
let startMap=null;
const wsMap = new WebSocket('ws://172.16.158.198:8080/websocket');
wsMap.onopen = function () {
  document.getElementById('startExplore').addEventListener('click', function () {
    startMap = setInterval(function () {
      console.log('请求地图定时器1:',startMap);
      if(startMap==null){
        return;
      }

      // const messagesDiv = document.getElementById('messages');
      // messagesDiv.innerHTML += `<p>${"探索中"}</p>`;
      // messagesDiv.scrollTop = messagesDiv.scrollHeight;

      const dataMapRequire = {
        type: 'GET_MAP_VIEW',
      };

      wsMap.send(JSON.stringify(dataMapRequire));

      wsMap.onmessage = function (event) {
        console.log(event.data);

        const dataModify = JSON.parse(event.data);
        console.log(dataModify);

        for (let i = 0; i < dataModify.length; i++) {
          var x0 = dataModify[i].x;
          var y0 = dataModify[i].y;
          var x = x0;
          var y = mapSize - y0 - 1;
          data[x * mapSize + y] = [x, y, 1];
        }
      };

      myChart.setOption
        (
          {
            series:
              [
                {
                  data: data
                }
              ]
          });
    }, 200);
  })
};

/**
  * 暂停探索
  */
document.getElementById('pauseExplore').addEventListener('click', function () {
  clearInterval(startMap);
  startMap = null;
  console.log('请求地图定时器2:',startMap);

  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML += `<p>${"暂停探索"}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
})

/**
 * 清空地图
 */
document.getElementById('clearAll').addEventListener('click', function () {
  var index = 0;
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      data[index] = [i, j, 0];
      index++;
    }
  }

  myChart.setOption
    ({
      series:
        [
          {
            data: data
          }
        ]
    });
})

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);