<template>
  <div
    id="app"
    @touchmove.prevent
    v-loading="loading"
    element-loading-text="注册中。。。"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row :gutter="10" type="flex" align="middle" justify="center">
      <el-col :xs="18" :sm="9" :md="7" :lg="7" :xl="7">
        <div class="grid-content">
          <div class="login_form">
            <el-form
              ref="form"
              :model="form"
              :rules="rules"
              label-width="80px"
              status-icon
              @submit.native.prevent="toSignUp"
            >
              <p>欢迎注册！</p>
              <el-form-item prop="account" label="账 号" size="auto">
                <el-input v-model="form.account"></el-input>
              </el-form-item>
              <el-form-item label="密 码" size="auto" prop="psw1">
                <el-input v-model="form.psw1" type="password" show-password autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" size="auto" prop="psw2">
                <el-input v-model="form.psw2" type="password" show-password autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item
                label="验证码"
                size="auto"
                prop="check"
                :rules="[{required: true,message: '请输入验证码', trigger: 'blur'}]"
              >
                <el-input v-model="form.check">
                  <el-tooltip
                    content="请同意注册协议"
                    placement="bottom"
                    effect="light"
                    :disabled="hasRead"
                    slot="append"
                  >
                    <el-button :disabled="!hasRead">获取验证码</el-button>
                  </el-tooltip>
                  <!-- <el-button slot="append" :disabled="!checked">获取验证码</el-button> -->
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="hasRead">我已阅读并同意注册协议</el-checkbox>
              </el-form-item>
              <el-form-item>
                <div class="login_button">
                  <el-tooltip
                    content="请检查表单"
                    placement="bottom"
                    effect="light"
                    :disabled="hasRead&&accountValid&&psw1Valid&&psw2Valid"
                  >
                    <el-button
                      :disabled="!hasRead || !accountValid || !psw1Valid || !psw2Valid"
                      native-type="submit"
                    >保存</el-button>
                  </el-tooltip>
                  <el-button>重置</el-button>
                  <el-button @click="toLogin()">登录</el-button>
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
    //验证用户名
    var checkAccount = async (rule, value, callback) => {
      if (value === "") {
        this.accountValid = false;
        callback(new Error("账户不能为空"));
      } else {
        const res = await this.$http.get(`/${this.form.account}`);
        if (res.data) {
          this.accountValid = false;
          callback(new Error("用户已存在"));
        } else {
          this.accountValid = true;
          callback();
        }
      }
    };
    //验证密码1
    var checkpsw1 = (rule, value, callback) => {
      if (value === "") {
        this.psw1Valid = false;
        callback(new Error("密码不能为空"));
      } else {
        if (this.form.psw1 !== "") {
          this.$refs.form.validateField("psw2");
        }
        this.psw1Valid = true;
        callback();
      }
    };

    var checkpsw2 = (rule, value, callback) => {
      if (value === "") {
        this.psw2Valid = false;
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.psw1) {
        this.psw2Valid = false;
        callback(new Error("两次输入密码不一致!"));
      } else {
        this.psw2Valid = true;
        callback();
      }
    };

    return {
      form: {
        account: "",
        psw1: "",
        psw2: "",
        check: ""
      },
      loading: false,
      hasRead: false,
      accountValid: false,
      psw1Valid: false,
      psw2Valid: false,
      rules: {
        account: [{ required: true, validator: checkAccount, trigger: "blur" }],
        psw1: [{ required: true, validator: checkpsw1, trigger: "blur" }],
        psw2: [{ required: true, validator: checkpsw2, trigger: "blur" }]
      }
    };
  },
  created() {},
  components: {},
  methods: {
    toLogin() {
      this.$router.push({ path: "./login" });
    },
    async toSignUp() {
      try {
        this.loading = true;
        const res = await this.$http.post("/api/users", this.form);
        this.$message({
          type: "success",
          message: "注册成功"
        });
        this.loading = false;
      } catch (error) {
        this.$message({
          type: "error",
          message: "注册失败"
        });
        this.loading = false;
      }
      this.clear();
    },
    clear() {
      this.form.account = "";
      this.form.psw1 = "";
      this.form.psw2 = "";
      this.form.check = "";
      this.hasRead = false;
      this.psw1Valid = false;
      this.psw2Valid = false;
      this.accountValid = false;
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

.el-checkbox__inner {
  color: white !important;
  background: black !important;
  border: 1px solid white !important;
}
.el-checkbox__label {
  color: white;
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
