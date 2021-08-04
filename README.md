# Cls-Helper

结合 [Cls-Snippet-Gen](https://github.com/engvuchen/cls-snippet-gen)，在 Vue 文件中提供自动补全功能。

## 使用

均在项目根目录下运行：

```bash
# 内网
npm config set registry http://r.tnpm.oa.com/
npm install @tencent/weadmin-components-bizadmin
npx cls-snippet-gen --add
```

```bash
# 外网
npm config set registry https://registry.npmjs.org/
npm install @weadmin/wecomponents
npx cls-snippet-gen --add --prod
```
