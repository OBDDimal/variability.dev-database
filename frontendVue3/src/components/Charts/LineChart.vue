<template>
  <Line :data="props.chartdata" :options="options" ref="myChart" @contextmenu="onContextMenu($event)" class="charts"/>
  <context-menu></context-menu>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  LogarithmicScale,
  Legend,
} from 'chart.js'
import {Line, getElementAtEvent} from 'vue-chartjs'
import {ref, onMounted, watch, computed} from "vue";
import ContextMenu from '@imengyu/vue3-context-menu';
import { local } from 'd3';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend
)
const props = defineProps({
  chartdata: {
    type: Object,
    required: false,
  },
});


/*const chartData = ref({
  labels: labels.value,
  datasets: datasets.value
})*/
const emit = defineEmits(['onHover', 'onUnHover']);
const options = ref({
  responsive: true,
  pointHoverRadius: 10,
  onHover: handleHover,
  onLeave: handleMouseLeave(),
  maintainAspectRatio: false,
})
function handleMouseLeave(event, elements){
    emit("onUnHover")
}
function handleHover(event, elements){
  if (elements.length > 0) {
    const hoveredIndex = elements[0].index;
    emit("onHover", hoveredIndex)
  }
  else {
    emit("onUnHover")
  }
}





function changeXLabels() {
  
  console.log("CLICK");
  

  console.log(props.chartdata.labels);
  
  //console.log(myChart._value.chart.scales.x.type);
  if(myChart._value.chart.scales.x.type == 'category'){
    myChart._value.chart.scales.x.type = 'logarithmic';
    //myChart._value.chart.scales.y.type = 'logarithmic';
    //console.log(myChart._value.chart.scales.x.type);
    //console.log(myChart._value.chart);


    myChart._value.chart.options.scales.x = {
          type: 'logarithmic'
      };
  }

  else{
    myChart._value.chart.scales.x.type = 'category';

    myChart._value.chart.options.scales.x = {
          type: 'category'
      };
  }
  

  /*myChart._value.chart.options.scales.y = {
        type: 'logarithmic'
    };*/

/*
  myChart._value.chart.options = {
    responsive: true,
        plugins: {
            title: {
                display: true
                //text: 'Chart.js'
            }
        },
        scales: {
            x: {
                display: true,
                type:'logarithmic'
            },
            y: {
                display: true
            }
        }
  };

*/
  myChart._value.chart.update();
  //console.log(props.chartdata.labels);

} 



function changeYLabels() {
  
  console.log("CLICK");
  

  console.log(props.chartdata.labels);
  
  console.log(myChart._value.chart.scales.y.type);
  if(myChart._value.chart.scales.y.type == 'linear'){
    myChart._value.chart.scales.y.type = 'logarithmic';
    


    myChart._value.chart.options.scales.y = {
          type: 'logarithmic'
      };
  }

  else{
    myChart._value.chart.scales.y.type = 'linear';

    myChart._value.chart.options.scales.y = {
          type: 'linear'
      };
  }

  
  myChart._value.chart.update();
  

} 


const myChart = ref(null);


const saveStorage = function(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
};


function multipleYAxis() {
  
  if (localStorage.getItem("data") == null){
    console.log("IF")
    saveStorage("data", props.chartdata.datasets[0].data);
    saveStorage("color", props.chartdata.datasets[0].borderColor);
    saveStorage("label", props.chartdata.datasets[0].label);
  }

  else{
    console.log("ELSE");
    let olddata = JSON.parse(localStorage.getItem("data"));
    let color = JSON.parse(localStorage.getItem("color"));
    let label = JSON.parse(localStorage.getItem("label"));
    localStorage.clear();
    
    let arr = [];
    for(let i=0; i<myChart._value.chart.data.datasets.length; i++){     
      arr.push(myChart._value.chart.data.datasets[i].label);
    }

    if(!arr.includes(label)){
      myChart._value.chart.data.datasets.push({
        //label: 'Dataset 2',
        label: label,
        //data: [28, 48, 40, 19, 86, 27, 90],
        data: olddata,
        //borderColor: 'rgb(54, 162, 235)',
        borderColor: color,
        tension: 0.1
      });

      myChart._value.chart.update();
    } 
  }
}



/*
    myChart._value.chart.options = {
      responsive: true,
          plugins: {
              title: {
                  display: true
                  //text: 'Chart.js'
              }
          },
          scales: {
              x: {
                  display: true,
                  type:'logarithmic'
              },
              y: {
                  display: true
              }
          }
    };*/



function onContextMenu(e) {
  //prevent the browser's default menu
  e.preventDefault();
  //show your menu
  console.log(ContextMenu);
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      { 
        label: "Multiple Y Axis", 
        onClick: () => {
          //alert("You click a menu item");
          multipleYAxis();
        }
      },
      { 
        label: "Change Labels", 
        children: [
          { label: "X-Axis",
            onClick: () => {
              //alert("You click a menu item");
              changeXLabels();
            }
          },
          { label: "Y-Axis",
            onClick: () => {
              //alert("You click a menu item");
              changeYLabels();
            }
          },
        ]
      },
    ]
  }); 
}













</script>
