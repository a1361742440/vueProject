<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form class="login_form" :model="LoginForm" :rules="loginFromRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="LoginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="LoginForm.password" type="password"></el-input>
        </el-form-item>
        <div class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginFrom">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      LoginForm: {
        username: "",
        password: ""
      },
      loginFromRules: {
        username: [
          { required: true, message: "请输入你的登录名称", trigger: "blur" },
          { min: 3, max: 10, message: "名称长度在3到10个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入你的登录密码", trigger: "blur" },
          { min: 5, max: 15, message: "密码长度在5到15个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    resetLoginFrom() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const { data: result } = await this.$http.post("login", this.LoginForm);
        if (result.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        window.sessionStorage.setItem("token", result.data.token);
        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100vh;
  background-color: skyblue;
}
.login_box {
  background-color: #fff;
  height: 320px;
  width: 500px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: center;
  padding-bottom: 30px;
}
</style>