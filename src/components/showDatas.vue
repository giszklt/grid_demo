<template>
  <div class="data-panel">
    <span>选择网格大小：</span>
    <el-select v-model="value" placeholder="请选择网格大小">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <el-button style="margin-left:10px" @click="getGridData">查询网格数据</el-button>
    <div v-show="tableData.length" style="margin-top:10px">
      <span>选择时间：</span>
      <el-select v-model="selTime" placeholder="请选择筛选时间">
        <el-option v-for="(item) in timeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button style="margin-left:10px" @click="getTableDataViaTimeRange">时间筛选</el-button>
    </div>
    <el-table :data="tableData" border stripe style="width: 100%;margin-top:10px" max-height="500">
      <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
      <el-table-column
        v-for="(col, i) in cols"
        :key="i"
        :prop="col.prop"
        :label="col.label"
        align="center"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "showDatas",
  data() {
    return {
      dateTime: "",
      value: "",
      options: [
        {
          value: 1000,
          label: "1000m"
        },
        {
          value: 5000,
          label: "5000m"
        }
      ],
      selTime:'',
      timeOptions: [],
      cols: [
        {
          prop: "featurevaleu",
          label: "温度"
        }
      ],
      tableData: [],
      allTableDatas: [],
    };
  },
  mounted() {
    this.eventsInfor();
  },
  methods: {
    eventsInfor(){
      const self = this;
      this.$events.on('boxInfos', function(data){
        self.fillBoxInfos(data);
      });
    },
    getGridData() {
      if (this.value !== "") {
        this.$emit('gridsize', this.value)
        console.log("getGridData", this.value);
        return
        this.$axios.post(window.baseURL + '/gridinfo/allgridinfo',{length:this.value}).then(res => {
          console.log("@allgridinfo:",res);
          this.$events.emit("gridData", res.data.data);
        })
      } else {
        this.$message.warning("请选择网格大小");
      }
    },
    fillBoxInfos(data){
      console.log("fillBoxInfos",data);
      this.$axios.post(window.baseURL + '/gridinfo/returntime',data).then(res => {
        console.log("@returntime:",res);
        const resData = res.data.data;
        let tableInfos = [];
        this.timeOptions = [];
        Object.keys(resData).forEach(key => {
          resData[key].forEach(item => {
            tableInfos.push(
              {
                featurevaleu:item.featurevaleu,
                time:key
              }
            )
          })
          this.timeOptions.push(
            {
              value: key,
              label: key
            }
          )
        })
        this.tableData = tableInfos;
        this.allTableDatas = tableInfos;
      })
    },
    getTableDataViaTimeRange(){
      this.tableData = this.allTableDatas.filter(item => item.time == this.selTime);
    }
  }
};
</script>

<style scoped>
.data-panel {
  color: #000;
  background-color: rgba(238, 238, 238, 0.5);
  padding: 8px;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  left: 10px;
}
.self-bnt {
  margin: 10px 306px;
}
</style>
