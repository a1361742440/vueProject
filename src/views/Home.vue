<template>
  <div>
    <el-button type="info" @click="logout">信息按钮</el-button>
  </div>
</template>

<script>
export default {
  name: "home",
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script>