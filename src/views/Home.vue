<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="iscollapse?'60px':'200px'">
        <div class="toggle-button" @click="toggleCollase">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#0066ff"
          unique-opened
          :collapse="iscollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!--一级菜单 -->
            <template slot="title">
              <i :class="iconsObj[item.id]" class></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单 -->
            <el-menu-item
              v-for="subitem in item.children"
              :index="'/'+subitem.path"
              :key="subitem.id"
              @click="saveNavState('/'+subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import welcome from "../components/WelCome";
export default {
  name: "home",
  components: {
    welcome
  },
  data() {
    return {
      menulist: [],
      iconsObj: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      iscollapse: false,
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200)
        return this.$message.console.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    toggleCollase() {
      this.iscollapse = !this.iscollapse;
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
  width: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #fff;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  height: 24px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
</style>