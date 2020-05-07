<template>
  <div class="greet">
    hello,{{account}}!
    <el-button @click="logoff()">注销</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      account: ""
    };
  },
  methods: {
    async getInfo() {
      const res = await this.$http.get("/api/users");
      this.account = res.data;
    },
    logoff() {
      localStorage.clear();
      this.$message({
        type: "success",
        message: "已注销"
      });
      this.$router.push({ path: "./login" });
    }
  },
  created() {
    this.getInfo();
  }
};
</script>

<style>
html {
  background: black;
}
.greet {
  background: black;
  color: white;
}
</style>