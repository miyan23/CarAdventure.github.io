// 基于准备好的dom，初始化echarts实例
var myChartPie = echarts.init(document.getElementById('pie'), null,
  {
    // height:300,
  });

// 指定图表的配置项和数据
option =
{
  series:
    [
      {
        type: 'gauge',
        // 调整饼图与div之间的留白
        center: ['50%', '54%'],
        // 调整饼图大小
        radius: '100%',
        axisLine:
        {
          lineStyle:
          {
            width: 10,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer:
        {
          itemStyle:
          {
            color: 'auto'
          }
        },
        // 小刻度线
        axisTick:
        {
          distance: -10,
          length: 3,
          lineStyle:
          {
            color: '#fff',
            width: 1
          }
        },
        // 大刻度线
        splitLine:
        {
          distance: -10,
          length: 10,
          lineStyle:
          {
            color: '#fff',
            width: 2
          }
        },
        axisLabel:
        {
          color: 'inherit',
          distance: 20,
          fontSize: 12
        },
        detail:
        {
          valueAnimation: true,
          formatter: '{value} %',
          color: 'inherit',
          fontSize: 12,
        },
        data:
          [
            {
              value: 70
            }
          ]
      }
    ]
};

/**
 * 探索度
 */
let exploreDegree;
var degree;
const wsDegree = new WebSocket('ws://172.16.158.198:8080/websocket');
wsDegree.onopen = function () {
  document.getElementById('startExplore').addEventListener('click', function () {
    exploreDegree = setInterval(function () {
      if(exploreDegree==null){
        return;
      }

      const dataDegree = {
        type: 'GET_COVERRATE',
      }

      wsDegree.send(JSON.stringify(dataDegree));

      wsDegree.onmessage = function (event) {
        console.log(event.data);

        degree = parseFloat(event.data) * 100;
      }

      myChartPie.setOption(
        {
          series:
            [
              {
                data:
                  [
                    {
                      value: degree
                    }
                  ]
              }
            ]
        });
    }, 200);
  })
}

/**
 * 暂停定时器
 */
if (degree == 100) {
  clearInterval(exploreDegree);
  exploreDegree=null;
  alert('本次探索已完成!');
}

/**
 * 暂停探索
 */
document.getElementById('pauseExplore').addEventListener('click', function () {
  clearInterval(exploreDegree);
  exploreDegree=null;
})

// 使用刚指定的配置项和数据显示图表。
myChartPie.setOption(option)