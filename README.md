## 基于Vue和express的登录注册系统
<img src="http://images.nickname4th.vip/基于Vue和Node.js的登录注册系统.png" alt="基于Vue和Node.js的登录注册系统" style="zoom:50%;" />

这是一个简单的登录注册示例，包含了登录、注册和用户页面三个部分。本示例的代码保存在我的github仓库，如有不清楚的地方可以下载查阅

### 1 前端部分

#### 1.1 UI

UI方面使用了Element UI的按钮、表单和消息通知等组件。

* 引入ElementUI

  ```shell
  vue add element-ui
  ```

* 使用ElementUI

  ```javascript
  //element.js
  import Vue from 'vue'
  import Element from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'
  Vue.use(Element)
  /*这里是全局导入，将ElementUI可用的组件全部挂载到Vue上,
  这样我们就可以直接使用其组件了，如Vue.prototype.$message等
  ```

#### 1.2 网络请求http.js

前端网络请求使用了axios，通过async—await语法实现异步请求。

* 引入axios

  ```shell
  npm install vue-axios
  ```

* 配置http.js

  ```javascript
  import axios from 'axios'
  import Vue from 'vue'
  import router from './router/index'
  const http = axios.create({
      baseURL: 'http://localhost:3030'
  })
  //拦截器
  http.interceptors.request.use((config) => {
      if (localStorage.token) {
          config.headers.Authorization = 'Bearer ' + localStorage.token
      }
      return config
  })
  http.interceptors.response.use(res => {
      return res
  }, err => {
    //服务器无响应
      if (!err.response) {
          Vue.prototype.$message.error({
              type: 'error',
              message: "服务器连接失败"
          });
          return Promise.reject(err)
      }
      //服务端返回错误通用处理方案
      if (err.response.data.message) {
          Vue.prototype.$message.error({
              type: 'error',
              message: err.response.data.message
          });
          // console.log(err.response.status)
          if (err.response.status === 401) {
              router.push('/login')
          }
      }
      // console.log(err.response.data.message)
      return Promise.reject(err)
  })
  export default http
  ```

  上述代码进行了如下操作：

  * 配置了请求接口的Baseurl，请求时通过拼接访问具体接口，有利于隐私性。

  * 添加了请求拦截器，配合后端的权限机制，在访问需要用户登录后才能使用的页面时，在请求头中添加token，供后端验证。

  * 添加了全局错误处理的拦截，配合服务端返回的错误代码和信息，进行相应的展示和跳转，如这里收到服务端401代码则返回登录页面。

  * 抛出http模块，在main.js中将其挂载到Vue的原型对象，便于直接通过**this**来使用。

    ```javascript
    import Vue from 'vue'
    import App from './App.vue'
    import './plugins/element.js'
    import router from './router'
    import http from './http'
    Vue.prototype.$http = http
    Vue.config.productionTip = false
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app')
    ```

#### 1.3 前端路由

使用vue-router实现前端路由。

* 引入vue-router

  ```shell
  vue add vue-router --save
  ```

* 定义router.js

  本示例中包含3个页面，相应的配置为：

  ```javascript
  import Vue from 'vue'
  import VueRouter from 'vue-router'
  Vue.use(VueRouter)
  const routes = [
    {
      path: '/',
      name: 'Login',
      component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
      meta: { isPublic: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
      meta: { isPublic: true }
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: () => import(/* webpackChunkName: "about" */ '../views/SignUp.vue'),
      meta: { isPublic: true }
    },
    {
      path: '/index:id',
      name: 'index',
      component: () => import(/* webpackChunkName: "about" */ '../views/index.vue'),
      meta: { isPublic: false }
    },
    {
      path: '*',
      name: 'notfound',
      component: () => import(/* webpackChunkName: "about" */ '../views/notfound.vue')
    }
  ]
  ```

  * 通过meta属性限定页面是否公开，配合全局导航守卫进行路由判断。

  * 通过'*'路由加入404页面。

##### 1.3.1 全局导航守卫

```javascript
router.beforeEach((to, from, next) => {
  if (!to.meta.isPublic && !localStorage.token) {
    Vue.prototype.$message({
      type: "warning",
      message: "请先登录"
    });
    next('/login')
  }
  next()
})
```

在页面跳转之前进行相应的判断，主要在非法访问页面时跳转到login页面。

#### 1.4 登录

##### 1.4.1 Login.vue

```vue
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
  components: {},
  methods: {
    async toLogin() {
      if (this.form.psw === "" || this.form.account==="") {
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
```

通过定义的toLogin方法进行登录，在前端限制了账户和密码非空，并通过Element的message进行提示。通过POST方法将表单数据。

#### 1.5 注册

##### 1.5.1 SignUp.vue

```vue
<script>
export default {
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
</script>
```

##### 1.5.2 表单验证

```javascript
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
};
```

表单验证使用了Element 的表单组件，通过callback函数和rule规则实现。其中触发规则为"blur"。

* 使用V-model绑定表单的值，通过hasRead等布尔值限制提交。
* 使用了loading组件对注册时的页面进行遮罩。

* 当且仅当5个条件判断的布尔值全部符合条件时，才允许提交注册请求。
* 一次注册成功之后，清除表单数据。

### 2 后端部分

后盾的数据库采用MongoDB，通过Node.js的mongoose插件进行数据库的操作。

#### 2.1登录接口

```javascript
    //登录接口
    app.post('/login', async (req, res) => {
        const { account, psw } = req.body
        //根据用户名找用户
        const user = await User.findOne({ account }).select('+psw')
        assert(user, 422, '用户不存在')
        //校验密码
        const isValid = require('bcrypt').compareSync(psw, user.psw)
        assert(isValid, 422, '用户名或密码错误')
        //签名返回token
        const token = jwt.sign({
            _id: user._id,
            id: user._id,
            username: user.account
        }, app.get('secret'))
        res.send({ token })
    })
```
登录时，通过解构赋值提取Post请求体中的账户和密码。登录验证的步骤如下：
* 根据用户名在数据库中查找用户信息，使用assert判断是否查找成功，若查找失败，服务端返回422错误，附带用户不存在的信息。
* 成功查找到用户后，使用bcrypt模块生成密码的摘要，与数据库中的摘要进行对比，如果对比失败，则服务端返回422错误，附带账户或密码错误的信息。
* 密码验证通过后，使用JSONWebToken进行签名，密钥为定义在服务端的密钥，返回200状态码，并返回token
#### 2.2 注册接口
```javascript
router.post('/', async (req, res) => {
        assert(req.body.psw1 === req.body.psw2, 422, '两次密码不一致')
        const accountLocal = await User.findOne({ account: req.body.account })
        assert(!accountLocal, 502, "用户已存在")
        const model = {}
        model.account = req.body.account;
        model.psw = req.body.psw1
        await req.Model.create(model)
        res.send(model)
    })
```
注册时，除了前端限制，也要在后端进行相应的处理，以避免绕过前端的恶意注册，注册步骤如下：
* 检验请求体的两次密码是否一致，不一致则返回422错误，附带两次密码不一致信息
* 若两次密码一致，则根据请求体的用户名在数据库进行查找，如果用户已经存在，则返回502错误，附带用户已存在的信息。
* 若无误，根据请求体的用户名和密码创建用户，存放到数据库中，其中密码经过bcrypt进行hash，而不是直接存放铭文。
#### 2.3 用户数据模型
```javascript
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    account: { type: String },
    psw: {
        type: String,
        select: false,
        set(val) {
            return require('bcrypt').hashSync(val, 10)
        },
    }
})
module.exports = mongoose.model('User', schema)
```
其中定义psw字段时使用set方法通过bcrypt对密码进行hash签名，生成摘要。用户在数据库中存储的方式为：

<img src="http://images.nickname4th.vip/用户在数据库中的存储信息.png" alt="用户在数据库中的存储信息" style="zoom:50%;" />

#### 2.4 全局错误处理

```javascript
app.use(async (err, req, res, next) => {
  res.status(err.statusCode || 500).send({
    message: err.message
  })
})
```

配合前端的http拦截器，返回错误信息。

### 3 中间件

#### 3.1 auth.js

登录成功之后，对应用户访问自己资源的行为需要通过token来鉴定是否具有相应的权限。

```javascript
//auth.js
module.exports = options => {
    const jwt = require('jsonwebtoken')
    const oUser = require('../models/User')
    const assert = require('http-assert')
    return async (req, res, next) => {
        const token = String(req.headers.authorization || '').split(' ').pop()
        assert(token, 401, '登录已过期')
        try {
            const { id } = jwt.verify(token, req.app.get('secret'))
            // console.log(id)
            assert(id, 401, '账户存在问题！')
            req.user = await oUser.findById(id)
            assert(req.user._id, 401, "登录已过期")
        } catch (error) {
            return res.status(401).send({ message: '登录已过期' })
        }
        // console.log(req.user)
        await next()
    }
}
```

在具体使用时，如下面的获取用户页面的请求：

```javascript
const auth = require('../middle/auth')
//查看个人信息
router.get('/', auth(), async (req, res) => {
  console.log("user", req.user.account)
  // const model = await req.Model.findOne({ account: req.user.account })
  res.send(req.user.account)
})
```

通过express的Router，在收到前端GET请求后，先通过CommJS的require语法执行上面auth.js中的代码，进行权限验证。

#### 3.2 resources.js

在将来如果有更多的资源，我们可以将接口统一起来，根据前端的需求动态的请求后端的资源，这样更加灵活方便。

```javascript
//resource.js
module.exports = options => {
    return async (req, res, next) => {
        const ModelName = require('inflection').classify(req.params.resource)
        console.log(req)
        req.Model = require(`../models/${ModelName}`)
        next()
    }
}
```

通过express的Router，将接口定义为

```javascript
const resource = require('../middle/resource')
app.use('/api/:resource', resource(), router)
```

这样在请求不同资源时，后端就会动态的访问对应的资源，如下面的请求

```javascript
async getInfo() {
  const res = await this.$http.get("/api/users");
  this.account = res.data;
},
```

表示获取User的数据。







