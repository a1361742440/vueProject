<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatedialog">添加分类</el-button>
        </el-col>
      </el-row>

      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效模板 -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!--排序模板 -->
        <template v-slot:sort="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="warning">二级</el-tag>
          <el-tag v-else type="danger">三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template v-slot:operation="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加弹出对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateFrom"
        :rules="addCateFromRules"
        ref="addCateFromRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            :options="ParentCateList"
            :props="{ expandTrigger: 'hover' , value: 'cat_id',label: 'cat_name',children: 'children' }"
            v-model="selectKeys"
            @change="ParenthandleChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "sort"
        },
        {
          label: "操作",
          type: "template",
          template: "operation"
        }
      ],
      addCatedialogVisible: false,
      addCateFrom: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      addCateFromRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blue" }
        ]
      },
      ParentCateList: [],
      selectKeys: []
    };
  },
  computed: {
    cateTotal() {
      return this.querInfo.pagenum * this.querInfo.pagesize;
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类失败");
      }
      // 把数据列表，赋值给 catelist
      this.catelist = res.data.result;

      // 为总数据条数赋值
      this.total = res.data.total;
      console.log(this.total);
    },
    handleSizeChange(newsize) {
      this.querInfo.pagesize = newsize;
      this.getCateList();
    },
    handleCurrentChange(newpage) {
      this.querInfo.pagenum = newpage;
      this.getCateList();
    },
    showAddCatedialog() {
      this.addCatedialogVisible = true;
      this.getParentCateList();
    },
    //获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.ParentCateList = res.data;
      console.log(this.ParentCateList);
    },
    ParenthandleChange() {
      console.log(this.selectKeys);
      if (this.selectKeys.length > 0) {
        this.addCateFrom.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        this.addCateFrom.cat_level = this.selectKeys.length;
        return;
      } else {
        this.addCateFrom.cat_pid = 0;
        this.addCateFrom.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateFrom
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败!");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCatedialogVisible = false;
      });
    },
    addCateDialogClose() {
      this.$refs.addCateFromRef.resetFields();
      this.selectKeys = [];
      this.addCateFrom.cat_level = 0;
      this.addCateFrom.cat_pid = 0;
    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>