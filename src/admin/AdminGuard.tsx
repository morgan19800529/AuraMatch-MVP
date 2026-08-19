// 这个文件目前没有被 main.tsx 引用（真正生效的是 src/components/AdminGuard.tsx），
// 之前在这里也硬编码了一份密码 '090826'，是重复的安全隐患，所以清空成一个直接转发，
// 避免以后有人手滑改成从这里导入、又把明文密码带回来。
export { AdminGuard } from '../components/AdminGuard';
