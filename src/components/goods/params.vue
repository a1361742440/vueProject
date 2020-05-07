<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
      <span>选择商品分类：</span>
      <el-cascader
        v-model="selectedCateKey"
        :options="catelist"
        :props="{ expandTrigger: 'hover' ,value:'cat_id', label:'cat_name',children:'children'}"
        @change="handleChange"
      ></el-cascader>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isdisabled" @click="showAddFrom">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  size="small"
                  @click="showInput(scope.row)"
                  class="button-new-tag"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isdisabled">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable>{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  size="small"
                  @click="showInput(scope.row)"
                  class="button-new-tag"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titelText"
      :visible.sync="addFromdialogVisible"
      width="50%"
      @close="addFromClose"
    >
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef">
        <el-form-item :label="titelText" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFromdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addparams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  data() {
    return {
      catelist: [],
      selectedCateKey: {},
      activeName: "many",
      manyTableData: [],
      onlyTableData: [],
      addFromdialogVisible: false,
      addFrom: {
        attr_name: ""
      },
      addFromRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blue" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    isdisabled() {
      return this.selectedCateKey.length !== 3;
    },
    cateId() {
      if (this.selectedCateKey.length === 3) {
        return this.selectedCateKey[2];
      } else {
        return null;
      }
    },
    titelText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.message.error("获取商品分类失败");
      }
      this.catelist = res.data;
    },
    //选定级联选择器变化时，会触发这个函数
    handleChange() {
      this.getparamsList();
    },
    //标签页变化时，会触发这个函数
    handleClick() {
      this.getparamsList();
    },
    //获取params的函数
    async getparamsList() {
      if (this.selectedCateKey.length !== 3) {
        this.selectedCateKey = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      //获取相对于的tabledata

      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    showAddFrom() {
      this.addFromdialogVisible = true;
    },
    addFromClose() {
      this.$refs.addFromRef.resetFields();
    },
    //添加属性
    addparams() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addFrom.attr_name,
            attr_sel: this.activeName
          }
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加属性失败");
        }
        this.$message.success("添加属性成功");
        this.addFromdialogVisible = false;
        this.getparamsList();
      });
    },
    showInput(row) {
      row.inputVisible = true;

      //让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;

      this.saveAttrVals(row);

      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }
      this.$message.success("修改参数项成功");
      row.inputVisible = false;
    },
    async saveAttrVals(row) {
      //发起请求，保持这次添加
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
    },

    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 10px;
}
.el-cascader {
  margin-top: 10px;
}
.el-input {
  width: 120px;
}
</style>