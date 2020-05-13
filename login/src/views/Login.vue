<template>
  <div id="app" @touchmove.prevent>
    <el-row :gutter="10" type="flex" align="middle" justify="center">
      <el-col :xs="18" :sm="9" :md="7" :lg="7" :xl="7">
        <div class="grid-content">
          <div class="login_form">
            <el-form ref="form" :model="form" label-width="40px" @submit.native.prevent="toLogin">
              <p>请登录！</p>
              <el-form-item label="账号" size="auto">
                <el-input v-model="form.account"></el-input>
              </el-form-item>
              <el-form-item label="密码" size="auto">
                <el-input v-model="form.psw" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <div class="login_button">
                  <el-button native-type="submit">登录</el-button>
                  <el-button @click="toSignUp()">注册</el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      form: {
        account: "",
        psw: ""
      }
    };
  },
  methods: {
    async toLogin() {
      if (this.form.psw == "") {
        this.$notify({
          title: "输入错误",
          message: "请检查账户和密码！",
          type: "error"
        });
      } else {
        const res = await this.$http.post("login", this.form);
        localStorage.token = res.data.token;
        this.$message({
          type: "success",
          message: "登录成功"
        });
        this.$router.push({ path: `./index${this.form.account}` });
      }
    },
    toSignUp() {
      this.$router.push({ path: "./signup" });
    }
  }
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: black;
}

.el-col {
  border-radius: 4px;
}

.el-row {
  height: 100vh;
  width: 100vw;
}
.el-form-item__label {
  color: white !important;
}
.el-input__inner {
  color: white !important;
  background: black !important;
  border: 1px solid white !important;
}
.el-button {
  color: white !important;
  background: black !important;
  border: 1px solid white !important;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid white;
  text-align: center;
  padding: 10px;
  color: white;
}
.login_button {
  flex-direction: row;
}
.login_form {
}
</style>
