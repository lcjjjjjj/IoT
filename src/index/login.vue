<template>
  <div>
    <el-form
      ref="loginForm"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="login-box"
    >
      <h3 class="login-title">欢迎登录</h3>
      <el-form-item label="账号" prop="username">
        <el-input
          type="text"
          placeholder="请输入账号"
          v-model="form.username"
          @keyup.enter.native="onSubmit_like"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          placeholder="请输入密码"
          v-model="form.password"
          @keyup.enter.native="onSubmit_like"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-on:click="onSubmit"  >登录</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="温馨提示" :visible.sync="dialogVisible" width="30%">
      <span>请输入账号和密码</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {request} from "./network.js"
export default {
  name: "Login",
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        username: [
          { required: true, message: "账号不可为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不可为空", trigger: "blur" },
        ],
      },
      // 对话框显示和隐藏
      dialogVisible: false,
    };
  },
  methods: {
    onSubmit() {
      //   this.$route
            //    this.$router.replace("/shipinformation");

      {
        request({
          url: "system/auth/login",
          method: "post",
          data: ({
            username: this.form.username,
            password: this.form.password,
          }),
        }).then((res) => {
          console.log(res,"看一下有无东西");
          if (res.data&&res.data.accessToken) {
            sessionStorage.setItem("token", res.data.accessToken);
            sessionStorage.setItem("username", this.form.username);
            this.$message({
              message: "登录成功",
              type: "success",
              duration: 1000
            });
            console.log("打印一下试试看");
            this.$router.replace("/index");
          } else {
            this.$message({
              message: res.message || "登录失败",
              type: "error",
              duration: 1000
            });
          }
        });
      }
    },
    onSubmit_like(e) {
      if(e.keyCode === 13){
        console.log("onSubmit_like，打印一下这个");
        this.onSubmit()
      }
    }

  },
};
</script>

<style  scoped>
.login-box {
  border: 1px solid #dcdfe6;
  width: 350px;
  margin: 180px auto;
  padding: 35px 35px 15px 35px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  box-shadow: 0 0 25px #909399;
}

.login-title {
  text-align: center;
  margin: 0 auto 40px auto;
  color: #303133;
}
</style>
